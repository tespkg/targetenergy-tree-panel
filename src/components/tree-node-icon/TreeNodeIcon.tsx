import React from 'react'
import { ReactSVG } from 'react-svg'

type TreeNodeIconProps = {
  svgPath: string
}

const TreeNodeIcon: React.FC<TreeNodeIconProps> = ({ svgPath }) => {
  return <ReactSVG src={svgPath} onError={(error) => console.error(error)} className="tpp--tree-node--icon" />
}

export default TreeNodeIcon
