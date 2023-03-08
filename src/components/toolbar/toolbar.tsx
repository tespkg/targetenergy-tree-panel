import { ClassNamesArg, cx } from '@emotion/css'
import React from 'react'
import './style.css'

type ToolbarProps = {
  className?: ClassNamesArg
  children: React.ReactElement[] | React.ReactElement
}

const Toolbar: React.FC<ToolbarProps> = ({ className, children }) => {
  return <div className={cx('toolbar', className)}>{children}</div>
}

export default React.memo(Toolbar)
