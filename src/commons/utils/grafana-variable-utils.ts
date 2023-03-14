import { getTemplateSrv, locationService } from '@grafana/runtime'
import {
  BLOCK_DATABASE_INDEX,
  COMPANY_DATABASE_LEVEL,
  COMPLETION_DATABASE_INDEX,
  CONTINENT_DATABASE_LEVEL,
  COUNTRY_DATABASE_LEVEL,
  FIELD_DATABASE_INDEX,
  PRODUCTION_STATION_DATABASE_INDEX,
  REGION_DATABASE_INDEX,
  RESERVOIR_DATABASE_INDEX,
  TYPE_DATABASE_LEVEL,
  WELL_DATABASE_INDEX,
} from 'commons/constants/database-constants'
import { FIRST_FOUR_LEVELS_SORTING_VARIABLE_NAME, TREE_FILTERS_VARIABLE_NAME } from './grafana-variable-constants'

// Grafana Variable Functions
const getGrafanaVariableAsJson = (variableName: string) => JSON.stringify(getGrafanaVariable(variableName))
export const getGrafanaVariable = (variableName: string) =>
  getTemplateSrv()
    .getVariables()
    .find((v) => v.name === variableName)
export const setGrafanaVariable = (variableName: string, value: string) =>
  locationService.partial({ [`var-${variableName}`]: value }, true)

// Get/Set first four levels sorting variable
export const getFirstFourLevelsSortingVariableAsJson = () =>
  getGrafanaVariableAsJson(FIRST_FOUR_LEVELS_SORTING_VARIABLE_NAME)
export const setFirstFourLevelsSortingVariable = (value: string) =>
  setGrafanaVariable(FIRST_FOUR_LEVELS_SORTING_VARIABLE_NAME, value)
export const generateFirstFourLevelsSortingVariableValue = (optionIndices: OptionIndicesData): string => {
  // The DB is: Company | Operated(Type) | Continent | Country
  let levels = new Array(4).fill(0)
  levels[optionIndices.continentIndex] = CONTINENT_DATABASE_LEVEL
  levels[optionIndices.countryIndex] = COUNTRY_DATABASE_LEVEL
  levels[optionIndices.typeIndex] = TYPE_DATABASE_LEVEL
  levels[optionIndices.companyIndex] = COMPANY_DATABASE_LEVEL
  return '[' + levels.toString() + ']'
}

// Get/Set tree filters variable
export const getTreeFiltersVariableAsJson = () => getGrafanaVariableAsJson(TREE_FILTERS_VARIABLE_NAME)
export const setTreeFiltersVariable = (value: string) => setGrafanaVariable(TREE_FILTERS_VARIABLE_NAME, value)
export const generateTreeFiltersVariableValue = (
  optionIndices: OptionIndicesData,
  optionChecks: OptionChecksData
): string => {
  const toInteger = (b: boolean) => (b ? 1 : 0)
  let filters = new Array(11).fill(0)
  // Dynamic position filters
  filters[optionIndices.continentIndex] = toInteger(optionChecks.continentChecked)
  filters[optionIndices.countryIndex] = toInteger(optionChecks.countryChecked)
  filters[optionIndices.typeIndex] = toInteger(optionChecks.typeChecked)
  filters[optionIndices.companyIndex] = toInteger(optionChecks.companyChecked)
  // Fixed position filters
  filters[REGION_DATABASE_INDEX] = toInteger(optionChecks.regionChecked)
  filters[BLOCK_DATABASE_INDEX] = toInteger(optionChecks.blockChecked)
  filters[PRODUCTION_STATION_DATABASE_INDEX] = toInteger(optionChecks.productionStationChecked)
  filters[FIELD_DATABASE_INDEX] = toInteger(optionChecks.fieldChecked)
  filters[RESERVOIR_DATABASE_INDEX] = toInteger(optionChecks.reservoirChecked)
  filters[WELL_DATABASE_INDEX] = toInteger(optionChecks.wellChecked)
  filters[COMPLETION_DATABASE_INDEX] = toInteger(optionChecks.completionChecked)
  return '[' + filters.toString() + ']'
}
