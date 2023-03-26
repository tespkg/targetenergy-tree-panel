import { PanelPlugin } from '@grafana/data'
import { defaultFormatTemplate, TreePanel } from 'components/TreePanel'
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
      path: 'defaultValue',
      name: 'Default value for variable',
      description: 'The default value to set the tree query',
      defaultValue: 'True',
    })
    .addTextInput({
      path: 'formatQuery',
      name: 'Format query',
      settings: {
        rows: 5,
        expandTemplateVars: true,
        useTextarea: true,
      },
      description: 'Format selection into query from a handlebars.js template',
      defaultValue: defaultFormatTemplate,
    })
    .addTextInput({
      path: 'firstFourLevelsSortingVariableName',
      name: 'Sorting (First Four) Variable name',
      description: 'Name of the variable to set the sorting (first four)',
      defaultValue: 'first_four_levels_sorting',
    })
    .addTextInput({
      path: 'treeFiltersVariableName',
      name: 'Tree On/Off Switches Variable name',
      description: 'Name of the variable to set the tree on/off switches',
      defaultValue: 'tree_filters',
    })
    .addNumberInput({
      path: 'defaultExpansionLevel',
      name: 'Default Expansion Level',
      description: 'The default level value to expand tree at first look',
      defaultValue: 3,
    })
    .addBooleanSwitch({
      path: 'debug',
      name: 'Debug',
      description: 'Enable debug mode',
      defaultValue: false,
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
