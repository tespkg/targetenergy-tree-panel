import { PanelPlugin } from '@grafana/data'
import { TreePanel } from 'components/TreePanel'
import { TreeOptions } from 'types'

export const plugin = new PanelPlugin<TreeOptions>(TreePanel).setPanelOptions((builder) => {
  return builder
    .addSelect({
      path: 'field',
      name: 'Field',
      description: 'Choose field for display tree',
      settings: {
        options: [],
        getOptions: async (ctx) => {
          const fields = ctx.data[0]?.fields || []
          return fields.map((field) => ({ label: field.name, value: field.name }))
        },
      },
    })
    .addTextInput({
      path: 'variableName',
      name: 'Variable name',
      description: 'Name of the variable to set the tree query',
      defaultValue: 'treequery',
    })
    .addTextInput({
      path: 'formatQuery',
      name: 'Format query',
      description: 'Format selection into query, default: ',
      defaultValue: '',
    })
  // .addRadio({
  //   path: 'seriesCountSize',
  //   defaultValue: 'sm',
  //   name: 'Series counter size',
  //   settings: {
  //     options: [
  //       {
  //         value: 'sm',
  //         label: 'Small',
  //       },
  //       {
  //         value: 'md',
  //         label: 'Medium',
  //       },
  //       {
  //         value: 'lg',
  //         label: 'Large',
  //       },
  //     ],
  //   },
  // })
})
