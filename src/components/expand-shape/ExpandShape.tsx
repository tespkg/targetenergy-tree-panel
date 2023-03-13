import React from 'react'
import { ClassNamesArg, css, cx } from '@emotion/css'
import * as Constants from './Constants'
import './style.css'

type ExpandShapeProps = {
  className?: ClassNamesArg
  isExpanded: boolean
  onClick: () => void
}

const ExpandShape: React.FC<ExpandShapeProps> = ({ className, isExpanded, onClick }) => {
  const trianglePoints = React.useMemo(() => {
    const cellSize = Constants.EXPAND_SHAPE_WIDTH / 10
    //
    let ps = [
      [cellSize * 2, cellSize * 1],
      [cellSize * 8, cellSize * 5],
      [cellSize * 2, cellSize * 9],
    ]
    return ps.map((point) => point.join(',')).join(' ')
  }, [])

  const strokeWidth = React.useMemo(() => Constants.EXPAND_SHAPE_WIDTH / 10 + 1, [])

  return (
    <div
      className={cx(
        css`
          width: ${Constants.EXPAND_SHAPE_WIDTH}px;
          height: ${Constants.EXPAND_SHAPE_HEIGHT}px;
        `,
        'tpp-expand-shape',
        className
      )}
      onClick={onClick}
    >
      <svg
        className={cx(
          css`
            width: ${Constants.EXPAND_SHAPE_WIDTH}px;
            height: ${Constants.EXPAND_SHAPE_HEIGHT}px;
          `
        )}
      >
        <polygon
          className={cx(
            css`
              stroke-width: ${strokeWidth}px;
            `,
            'tpp-expand-shape--triangle',
            isExpanded ? 'expanded' : 'collapsed'
          )}
          points={trianglePoints}
        />
      </svg>
    </div>
  )
}

export default ExpandShape
