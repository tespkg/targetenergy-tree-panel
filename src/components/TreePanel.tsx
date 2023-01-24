import { css, cx } from '@emotion/css'
import { PanelProps } from '@grafana/data'
import { locationService, getTemplateSrv } from '@grafana/runtime'
import { Alert, Button, Checkbox, Icon, Input, Tooltip, useStyles2 } from '@grafana/ui'
import * as React from 'react'
import { TreeOptions } from 'types'
import { useDeepCompareMemoize } from 'use-deep-compare-effect'
import * as Handlebars from 'handlebars'

let rendercount = 0

interface Props extends PanelProps<TreeOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Roboto, Helvetica, Arial, sans-serif;
      position: relative;
    `,
  }
}
export const defaultFormatTemplate = `{{~#each .}}{{#if @index}} OR {{/if}}
{{~@key}} in ({{#each .}}{{~#if @index}},{{/if}}{{~id}}{{~/each}})
{{~/each}}`

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

  let formatTemplate = defaultFormatTemplate
  if (options.formatQuery) {
    formatTemplate = options.formatQuery
  }

  const hasVar = getTemplateSrv()
    .getVariables()
    .find((v) => v.name === variableName)
  let variableConfigError: React.ReactNode
  if (!hasVar || hasVar.type !== 'textbox') {
    variableConfigError = (
      <Alert title="Variable not configured properly" severity="error">
        Please create a &quot;Text box&quot; variable with name `{variableName}`.
        <br /> This plugin sets the variable when a node is selected.
        <br /> If you have the variable already, make sure it has the same name with the &quot;Variable name&quot; in
        the panel config.
      </Alert>
    )
  }

  const [showSelected, setShowSelected] = React.useState(false)
  let [dataRef, dataError] = React.useMemo(() => {
    try {
      return [transformData(rows ?? [])]
    } catch (e) {
      const error = (
        <Alert title={`Invalid data format in "${options.field}" column`}>
          Accepted data format are comma separated strings. Possible format of the strings:
          <ul>
            <li>id,id,id,...</li>
            <li>id:name,id:name,id:name,...</li>
            <li>id:name:type,id:name:type,id:name:type,...</li>
          </ul>
        </Alert>
      )
      return [[] as TreeNodeData[], error]
    }
    // Here we memorise the data if rows doesn't change, so that we can use the
    // data reference to record the folding & selected state
    //
    // Also we're implementing show selected by filter down the data. However,
    // because we're using references, we need to recompute the original data
    // so that no nodes are lost. Hence including `showSelected` here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, useDeepCompareMemoize([rows, field, showSelected]))

  // show selected
  const [selectedNodes, setSelectedNodes] = React.useState<TreeNodeData[]>([])
  const selectedNodeIds = React.useRef<string[]>([])
  selectedNodeIds.current = selectedNodes.map((n) => n.id)
  dataRef = React.useMemo(() => {
    // here data is always a clean state because it's recomputed from useMemo above
    let data = dataRef
    // restore selected state
    const walk = (node: TreeNodeData) => {
      if (selectedNodeIds.current.includes(node.id)) {
        node.selected = true
        let v = node
        while (v.parent) {
          v.parent.showChildren = true
          v = v.parent
        }
      }
      node.children?.forEach(walk)
    }
    walk({ id: '', name: '', children: data })
    if (showSelected) {
      const walk2 = (node: TreeNodeData) => {
        node.children = node.children?.filter((n) => n.selected || n.showChildren)
        node.children?.forEach(walk2)
      }
      walk2({ id: '', name: '', children: data })
    }
    return data
  }, [dataRef, showSelected])

  // filter selection with search
  const [searchText, setSearchText] = React.useState('')
  const debouncedSearchText = useDebounce(searchText, 250)
  dataRef = React.useMemo(() => {
    const walk = (node: TreeNodeData) => {
      const w = debouncedSearchText.replace(/[.+^${}()|[\]\\]/g, '\\$&') // regexp escape
      const re = new RegExp(w.replace(/\*/g, '.*').replace(/\?/g, '.'), 'i')
      if (!debouncedSearchText) {
        node.matchSearch = undefined
      } else if (re.test(node.name)) {
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
  console.log(rendercount++)

  const handleToggleFold = (expand?: boolean) => {
    const walk = (node: TreeNodeData) => {
      node.showChildren = expand
      node.children?.forEach(walk)
    }
    walk({ id: '', name: '', children: dataRef })
    forceRender({})
  }

  const handleToggleNode = (node: TreeNodeData) => {
    node.showChildren = !node.showChildren
    forceRender({})
  }

  const [formatTpl, formatTplError] = React.useMemo(() => {
    let error: React.ReactNode
    let fmt = formatTemplate
    try {
      Handlebars.parse(formatTemplate)
    } catch (e: any) {
      if (e.message) {
        error = (
          <Alert title="Incorrect format query">
            <pre>{e.message}</pre>
          </Alert>
        )
      }
      fmt = defaultFormatTemplate
    }
    return [Handlebars.compile(fmt), error]
  }, [formatTemplate])

  const handleSelectNode = (node: TreeNodeData) => {
    // exclusive selection: all parent & children needs to be deselected
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

    // walk all selected nodes and update query
    const selectedNodes: TreeNodeData[] = []
    const walk = (node: TreeNodeData) => {
      if (node.selected) {
        selectedNodes.push(node)
      }
      node.children?.forEach(walk)
    }
    walk({ id: '', name: '', children: dataRef })
    const entities: { [type: string]: object[] } = {}

    selectedNodes.forEach((node) => {
      const type = node.type ?? ''
      if (!entities[type]) {
        entities[type] = []
      }
      entities[type].push({ id: node.id, name: node.name, type: node.type })
    })
    // let query = ''
    // for (const type in entities) {
    //   if (query) {
    //     query += ' OR '
    //   }
    //   query += `${type} in (${entities[type].join(',')})`
    // }
    let query = formatTpl(entities)
    const queryVar = replaceVariables(`$${variableName}`)
    if (query === '') {
      query = options.defaultValue
    }
    if (queryVar !== query) {
      if (options.debug) {
        console.log(`setting variable ${variableName}`, query)
      }
      locationService.partial({ ['var-' + variableName]: query })
    }
    setSelectedNodes(selectedNodes)
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
      {variableConfigError}
      {formatTplError}
      {dataError}
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
          & > * {
            margin-right: 8px;
            margin-bottom: 4px;
          }
        `}
      >
        <Button size="sm" onClick={() => handleToggleFold(true)}>
          Expand All
        </Button>
        <Button size="sm" onClick={() => handleToggleFold(false)}>
          Collapse All
        </Button>
        <Checkbox value={showSelected} label="Show Selected" onChange={() => setShowSelected((prev) => !prev)} />
      </div>
      <TreeView items={dataRef} onToggleNode={handleToggleNode} onSelectNode={handleSelectNode} />
    </div>
  )
}

type TreeViewProps = {
  items: TreeNodeData[]
  onToggleNode: (node: TreeNodeData) => void
  onSelectNode: (node: TreeNodeData) => void
}

const TreeView: React.FC<TreeViewProps> = ({ items, onToggleNode, onSelectNode }) => {
  const nodes = items.map((item) => (
    <TreeNode key={item.id} data={item} onToggleNode={onToggleNode} onSelectNode={onSelectNode} />
  ))
  return <ul className={css``}>{nodes}</ul>
}

type TreeNodeProps = {
  data: TreeNodeData
  onToggleNode: (node: TreeNodeData) => void
  onSelectNode: (node: TreeNodeData) => void
}

const TreeNode: React.FC<TreeNodeProps> = ({ data, onToggleNode, onSelectNode }) => {
  const hasChildren = data.children && data.children.length > 0
  let showChildren = data.showChildren || data.matchSearch === MatchSearch.childMatch

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
          onClick={() => onToggleNode(data)}
        />
        <Checkbox
          className={css`
            margin-right: 6px;
          `}
          value={data.selected}
          onChange={() => onSelectNode(data)}
        />
        <Tooltip content={`id: ${data.id}, name: ${data.name}, type: ${data.type}`}>
          <span
            className={css`
              cursor: ${hasChildren ? 'pointer' : 'default'};
            `}
            onClick={() => onToggleNode(data)}
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
                  <TreeNode key={child.id} data={child} onToggleNode={onToggleNode} onSelectNode={onSelectNode} />
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

// function usePrevious<T>(value: T) {
//   // The ref object is a generic container whose current property is mutable ...
//   // ... and can hold any value, similar to an instance property on a class
//   const ref = React.useRef<T>()
//   // Store current value in ref
//   React.useEffect(() => {
//     ref.current = value
//   }, [value]) // Only re-run if value changes
//   // Return previous value (happens before update in useEffect above)
//   return ref.current
// }
