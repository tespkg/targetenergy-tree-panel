import React from 'react'
import { Alert } from '@grafana/ui'
import { getGrafanaVariable } from './grafana-variable-utils'

type GrafanaVariableAlertProps = {
  variableName: string
}

const GrafanaVariableAlert: React.FC<GrafanaVariableAlertProps> = ({ variableName }) => {
  const hasVar = getGrafanaVariable(variableName)
  return !hasVar || hasVar.type !== 'textbox' ? (
    <Alert title="Variable not configured properly" severity="error">
      Please create a &quot;Text box&quot; variable with name `{variableName}`.
      <br /> This plugin sets the variable when a node is selected.
      <br /> If you have the variable already, make sure it has the same name with the &quot;Variable name&quot; in the
      panel config.
    </Alert>
  ) : (
    <></>
  )
}

export default GrafanaVariableAlert
