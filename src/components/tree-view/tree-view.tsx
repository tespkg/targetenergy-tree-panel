import { css } from '@emotion/css'
import { TreeNodeData } from 'commons/types/tree-node-data'
import TreeNode from 'components/tree-node'
import React from 'react'

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

export default TreeView
