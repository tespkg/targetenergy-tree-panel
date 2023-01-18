import { css, cx } from '@emotion/css'
import { PanelProps } from '@grafana/data'
import { locationService } from '@grafana/runtime'
import { Button, Checkbox, Icon, Input, Tooltip, useStyles2 } from '@grafana/ui'
import * as React from 'react'
import { TreeOptions } from 'types'
import { useDeepCompareMemoize } from 'use-deep-compare-effect'

interface Props extends PanelProps<TreeOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
  }
}
// let rendercount = 0

export const TreePanel: React.FC<Props> = ({ options, data, width, height, replaceVariables }) => {
  const styles = useStyles2(getStyles)
  const { field, variableName } = options

  // Explanation why we use reference instead of use setState:
  // The problem is we want to implement exclusive selection:
  // When we select a node, we need to deselect all children and parents.
  // To implement this, we need to re-render the parts of the tree that's changed.
  // In addition, we want the state of the whole tree to be triggered so that we can know which nodes are selected.
  // For now, we're using a ref and update the whole tree when anything happens
  //
  // We could use use immer to facilitate this but it doesn't support recursive object, as we need to access parent node which is recursive
  const rows = data.series
    .map((d) => d.fields.find((f) => f.name === field))
    .map((f) => f?.values)
    .at(-1)
    ?.toArray()
  let dataRef = React.useMemo(() => {
    return transformData(rows ?? [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, useDeepCompareMemoize([rows, field]))

  // filter selection with search
  const [searchText, setSearchText] = React.useState('')
  const debouncedSearchText = useDebounce(searchText, 250)
  dataRef = React.useMemo(() => {
    const walk = (node: TreeNodeData) => {
      if (!debouncedSearchText) {
        node.matchSearch = undefined
      } else if (node.name.match(new RegExp(debouncedSearchText, 'i'))) {
        node.matchSearch = MatchSearch.match
        let v = node
        while (v.parent) {
          v = v.parent
          v.matchSearch = MatchSearch.childMatch
        }
      } else {
        node.matchSearch = MatchSearch.notMatch
      }
      node.children?.forEach(walk)
    }
    walk({ id: '', name: '', children: dataRef })
    return dataRef
  }, [dataRef, debouncedSearchText])

  const [_, forceRender] = React.useState({})
  // console.log(rendercount++)

  const handleFold = (expand?: boolean) => {
    const walk = (node: TreeNodeData) => {
      node.showChildren = expand
      node.children?.forEach(walk)
    }
    walk({ id: '', name: '', children: dataRef })
    forceRender({})
  }

  const handleUpdateTree = () => {
    const selectedNodes: TreeNodeData[] = []
    const walk = (node: TreeNodeData) => {
      if (node.selected) {
        selectedNodes.push(node)
      }
      node.children?.forEach(walk)
    }
    walk({ id: '', name: '', children: dataRef })
    const entities: { [type: string]: string[] } = {}

    selectedNodes.forEach((node) => {
      const type = node.type ?? ''
      if (!entities[type]) {
        entities[type] = []
      }
      entities[type].push(node.id)
    })
    let query = ''
    for (const type in entities) {
      if (query) {
        query += ' OR '
      }
      query += `${type} in (${entities[type].join(',')})`
    }
    const queryVar = replaceVariables(`$${variableName}`)
    if (queryVar !== query) {
      // console.log(`location called, ${queryVar} !== ${query}`)
      locationService.partial({ ['var-' + variableName]: query })
    } else {
      // console.log(`updateTree called, ${queryVar} === ${query}`)
      forceRender({})
    }
  }

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
          overflow: auto;
          padding: 4px;
        `
      )}
    >
      <Input
        label="Search"
        placeholder="Search"
        value={searchText}
        onChange={(e) => setSearchText(e.currentTarget.value)}
        className={css`
          margin-bottom: 8px;
        `}
      />
      <div
        className={css`
          display: flex;
        `}
      >
        <Button size="sm" onClick={() => handleFold(true)}>
          Expand All
        </Button>
        <Button size="sm" onClick={() => handleFold(false)}>
          Collapse All
        </Button>
      </div>
      <TreeView items={dataRef} onUpdateTree={handleUpdateTree} />
    </div>
  )
}

type TreeViewProps = {
  items: TreeNodeData[]
  onUpdateTree: () => void
}

const TreeView: React.FC<TreeViewProps> = ({ items, onUpdateTree }) => {
  const nodes = items.map((item) => <TreeNode key={item.id} data={item} updateTree={onUpdateTree} />)
  return <ul className={css``}>{nodes}</ul>
}

type TreeNodeProps = {
  data: TreeNodeData
  updateTree: (_?: any) => void
}

const TreeNode: React.FC<TreeNodeProps> = ({ data, updateTree }) => {
  const handleClick = (e: React.MouseEvent) => {
    data.showChildren = !data.showChildren
    // console.log('handleClick called')
    updateTree()
  }
  const handleSelect = (e: React.FormEvent) => {
    // stop propagation not working, setting onClick to sibling instead of parent
    // e.preventDefault()
    // e.stopPropagation()
    // e.nativeEvent.stopImmediatePropagation()
    // console.log('handleSelect called')
    let node = data
    const thisNode = node
    thisNode.selected = !node.selected
    if (thisNode.selected) {
      // unselect all parent
      while (node?.parent) {
        node = node.parent
        if (node?.selected) {
          node.selected = false
        }
      }
      // unselect all children
      const walk = (node: TreeNodeData) => {
        node.selected = false
        node.children?.forEach(walk)
      }
      thisNode.children?.forEach(walk)
    }
    updateTree()
  }
  const hasChildren = data.children && data.children.length > 0
  let showChildren = data.showChildren || data.matchSearch === MatchSearch.childMatch
  // const walk = (node: TreeNodeData) => {
  //   if (node.matchSearch === MatchSearch.match) {
  //     showChildren = true
  //   }
  //   node.children?.forEach(walk)
  // }
  // data.children?.forEach(walk)

  return (
    <li
      className={cx(css`
        list-style: none;
      `)}
    >
      <div
        className={cx(css`
          height: 2rem;
          display: flex;
          align-items: center;
        `)}
      >
        <Icon
          className={css`
            visibility: ${hasChildren ? 'visible' : 'hidden'};
            cursor: ${hasChildren ? 'pointer' : 'default'};
          `}
          name={showChildren ? 'angle-down' : 'angle-right'}
          onClick={handleClick}
        />
        <Checkbox
          className={css`
            margin-right: 6px;
          `}
          value={data.selected}
          onChange={handleSelect}
        />
        <Tooltip content={`id: ${data.id}, name: ${data.name}, type: ${data.type}`}>
          <span
            className={css`
              cursor: ${hasChildren ? 'pointer' : 'default'};
            `}
            onClick={handleClick}
          >
            {data.name}
          </span>
        </Tooltip>
      </div>
      {hasChildren && (
        <ul
          className={css`
            margin-left: 16px;
          `}
        >
          {showChildren &&
            data.children?.map(
              (child) =>
                (child.matchSearch === MatchSearch.match ||
                  child.matchSearch === undefined ||
                  child.matchSearch === MatchSearch.childMatch) && (
                  <TreeNode key={child.id} data={child} updateTree={updateTree} />
                )
            )}
        </ul>
      )}
    </li>
  )
}

enum MatchSearch {
  match,
  notMatch,
  childMatch,
}

type TreeNodeData = {
  id: string
  name: string
  type?: string
  parent?: TreeNodeData
  children?: TreeNodeData[]
  // ui state
  showChildren?: boolean
  selected?: boolean
  matchSearch?: MatchSearch
}

function transformData(rows: string[]): TreeNodeData[] {
  const table = rows.map((row) =>
    row.split(',').map((column) => {
      const parts = column.split(':')
      const item: TreeNodeData = {
        id: parts[0],
        name: parts[0],
      }
      if (parts.length >= 2) {
        item.name = parts[1]
      }
      if (parts.length >= 3) {
        item.type = parts[2]
      }
      return item
    })
  )
  const root: TreeNodeData[] = []
  let items: TreeNodeData[] = root
  for (let i = 0; i < table.length; i++) {
    const row = table[i]
    for (let j = 0; j < row.length; j++) {
      const item = row[j]
      if (j === 0) {
        items = root
      } else {
        // find parent level
        const parent = items.find((i) => i.id === row[j - 1].id) ?? throwExpression('parent not found')
        if (!parent.children) {
          parent.children = []
        }
        items = parent.children
        item.parent = parent
      }
      if (items.findIndex((i) => i.id === item.id) < 0) {
        items.push(item)
      }
    }
  }
  return root
}

function throwExpression(errorMessage: string): never {
  throw new Error(errorMessage)
}

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
