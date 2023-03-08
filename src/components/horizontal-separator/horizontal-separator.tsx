import { ClassNamesArg, cx } from '@emotion/css'
import React from 'react'
import './style.css'

type HorizontalSeparatorProps = {
  className?: ClassNamesArg
}

const HorizontalSeparator: React.FC<HorizontalSeparatorProps> = ({ className }) => {
  return <div className={cx('horizontal-separator', className)}></div>
}

export default React.memo(HorizontalSeparator)
