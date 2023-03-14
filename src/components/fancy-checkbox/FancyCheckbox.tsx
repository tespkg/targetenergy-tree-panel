import { Checkbox } from '@grafana/ui'
import React from 'react'
import './style.css'

type FancyCheckboxProps = {
  title: string
  defaultChecked?: boolean
  onChange?: React.FormEventHandler<HTMLInputElement> | undefined
}

const FancyCheckbox: React.FC<FancyCheckboxProps> = ({ title, defaultChecked = false, onChange }) => {
  return (
    <div className="tpp-fancy-checkbox">
      <span>{title}</span>
      <Checkbox defaultChecked={defaultChecked} onChange={onChange} />
    </div>
  )
}

export default FancyCheckbox
