import { css, cx } from '@emotion/css'
import { Checkbox, Tooltip } from '@grafana/ui'
import { MatchSearch } from 'commons/enums/MatchSearch'
import { TreeNodeData } from 'commons/types/TreeNodeData'
import ExpandShape from 'components/expand-shape/ExpandShape'
import React from 'react'
import { getTreeNodeIcon } from 'commons/utils/tree-node-icon-utils'
import './style.css'

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
        <ExpandShape
          className={css`
            visibility: ${hasChildren ? 'inherited' : 'hidden'};
            cursor: ${hasChildren ? 'pointer' : 'default'};
            margin-right: 10px;
          `}
          isExpanded={showChildren}
          onClick={() => onToggleNode(data)}
        />
        <Checkbox
          className={css`
            margin-right: 6px;
          `}
          value={data.selected}
          onChange={() => onSelectNode(data)}
        />
        {getTreeNodeIcon(data)}
        <Tooltip content={`id: ${data.id}, name: ${data.name}, type: ${data.type}`}>
          <span
            className={cx(
              css`
                cursor: ${hasChildren ? 'pointer' : 'default'};
              `,
              'tpp--tree-node--checkbox-title'
            )}
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

export default TreeNode
