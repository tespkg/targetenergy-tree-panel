import { css, cx } from '@emotion/css'
import { PanelProps } from '@grafana/data'
import { Alert, Button, Checkbox, Input, useStyles2 } from '@grafana/ui'
import * as React from 'react'
import { TreeOptions } from 'types'
import { useDeepCompareMemoize } from 'use-deep-compare-effect'
import * as Handlebars from 'handlebars'
import { TreeNodeData } from 'commons/types/TreeNodeData'
import { MatchSearch } from 'commons/enums/MatchSearch'
import Toolbar from './toolbar/TreeToolbar'
import HorizontalSeparator from './horizontal-separator/HorizontalSeparator'
import TreeView from './tree-view/TreeView'
import SettingsPopup from './settings-popup/SettingsPopup'
import { setGrafanaVariable } from 'commons/utils/grafana-variable-utils'
import GrafanaVariableAlert from 'commons/utils/GrafanaVariableAlert'
import './style.css'

let renderCount = 0

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
  const { field, variableName, firstFourLevelsSortingVariableName, treeFiltersVariableName, defaultExpansionLevel } =
    options

  const rows = data.series
    .map((d) => d.fields.find((f) => f.name === field))
    .map((f) => f?.values)
    .at(-1)
    ?.toArray()

  let formatTemplate = defaultFormatTemplate
  if (options.formatQuery) {
    formatTemplate = options.formatQuery
  }

  const [showSelected, setShowSelected] = React.useState(false)
  // Explanation why we use reference instead of use setState:
  // The problem is we want to implement exclusive selection. When we select a
  // node, we need to deselect all children and parents. To implement the
  // deselection effectively, we need to be able to walk to children as well as
  // parents.
  // We could use immer to facilitate this but it doesn't support recursive
  // object, and the parent node is recursive.
  // So here our solution is to use just one data object and by changing
  // the nested properties of this object, we record the "select" and "fold"
  // state.
  // However, as the reference of the data doesn't change, react won't trigger
  // a re-render. Hence the forceRender set state call
  let [dataRef, dataError] = React.useMemo(() => {
    try {
      return [transformData(rows ?? [], defaultExpansionLevel)]
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
    // Here we memorize the data if rows doesn't change, so that we can use the
    // data reference to record the folding & selected state
    //
    // Also we're implementing show selected by filter down the data. However,
    // because we're using references, we need to recompute the original data
    // so that no nodes are lost. Hence including `showSelected` here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, useDeepCompareMemoize([rows, field, showSelected, defaultExpansionLevel]))

  // show selected
  const selectedNodes = React.useRef<TreeNodeData[]>([])
  dataRef = React.useMemo(() => {
    // here data is always a clean state because it's recomputed from useMemo above
    let data = dataRef
    // restore selected state
    const walk = (node: TreeNodeData) => {
      if (selectedNodes.current.map((n) => n.id).includes(node.id)) {
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
  // const debouncedSearchText = React.useDeferredValue(searchText)
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
  console.log(renderCount++)

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
    const selected: TreeNodeData[] = []
    const walk = (node: TreeNodeData) => {
      if (node.selected) {
        selected.push(node)
      }
      node.children?.forEach(walk)
    }
    walk({ id: '', name: '', children: dataRef })
    selectedNodes.current = selected

    const entities: { [type: string]: object[] } = {}

    selected.forEach((node) => {
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
      setGrafanaVariable(variableName, query)
    }
    // this should be needed, but in production build, the locationService.partial didn't trigger an re-render
    forceRender({})
  }

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
          padding: 4px;
        `
      )}
    >
      <GrafanaVariableAlert variableName={variableName} />
      <GrafanaVariableAlert variableName={firstFourLevelsSortingVariableName} />
      <GrafanaVariableAlert variableName={treeFiltersVariableName} />
      {formatTplError}
      {dataError}
      <Toolbar>
        <Input
          label="Search"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.currentTarget.value)}
          className={css`
            margin-bottom: 8px;
          `}
        />
        <SettingsPopup
          firstFourLevelsSortingVariableName={firstFourLevelsSortingVariableName}
          treeFiltersVariableName={treeFiltersVariableName}
        />
      </Toolbar>
      <Toolbar>
        <Button className="tpp--button primary" size="sm" onClick={() => handleToggleFold(true)}>
          Expand All
        </Button>
        <Button className="tpp--button primary" size="sm" onClick={() => handleToggleFold(false)}>
          Collapse All
        </Button>
      </Toolbar>
      <Toolbar>
        <Checkbox
          className="tpp--checkbox"
          value={showSelected}
          label="Show Selected"
          onChange={() => setShowSelected((prev) => !prev)}
        />
      </Toolbar>
      <HorizontalSeparator />
      <TreeView items={dataRef} onToggleNode={handleToggleNode} onSelectNode={handleSelectNode} />
    </div>
  )
}

function transformData(rows: string[], expansionLevel: number): TreeNodeData[] {
  // splits each row into items
  const table = rows.map((row) =>
    row.split(',').map((column) => {
      const parts = column.split(':')
      // default we suppose id,id,id,... format
      const item: TreeNodeData = {
        id: parts[0],
        name: parts[0],
      }
      // let's check if we have id:name,id:name,id:name,... format
      if (parts.length > 1) {
        item.name = parts[1]
      }
      // let's check if we have id:name:type,id:name:type,id:name:type,... format
      if (parts.length > 2) {
        item.type = parts[2]
      }
      return item
    })
  )
  const root: TreeNodeData[] = []
  let items: TreeNodeData[] = root
  for (let i = 0; i < table.length; i++) {
    const row = table[i]
    for (let levelIndex = 0; levelIndex < row.length; levelIndex++) {
      const item = row[levelIndex]
      if (levelIndex === 0) {
        items = root
      } else {
        // find parent level
        const parent = items.find((i) => i.id === row[levelIndex - 1].id) ?? throwExpression('parent not found')
        if (!parent.children) {
          parent.children = []
        }
        items = parent.children
        item.parent = parent
      }
      if (levelIndex < expansionLevel) {
        item.showChildren = true
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
