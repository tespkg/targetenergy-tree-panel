import { VariableWithOptions } from '@grafana/data'
import { getTemplateSrv, locationService } from '@grafana/runtime'
import {
  BLOCK_DATABASE_INDEX,
  COMPANY_DATABASE_INDEX,
  COMPLETION_DATABASE_INDEX,
  CONTINENT_DATABASE_INDEX,
  COUNTRY_DATABASE_INDEX,
  FIELD_DATABASE_INDEX,
  PRODUCTION_STATION_DATABASE_INDEX,
  REGION_DATABASE_INDEX,
  RESERVOIR_DATABASE_INDEX,
  TYPE_DATABASE_INDEX,
  WELL_DATABASE_INDEX,
} from 'commons/constants/database-constants'
import { toOneBased } from './number-utils'

// Grafana Variable Functions
export const getGrafanaVariable = (variableName: string) => {
  const vars = getTemplateSrv().getVariables()
  return vars.find((v) => v.name === variableName)
}
const getGrafanaVariableRawValue = (variableName: string) =>
  (getGrafanaVariable(variableName) as VariableWithOptions)?.current.value
export const getGrafanaVariableAsNumberArray = (variableName: string) => {
  const rawValue = getGrafanaVariableRawValue(variableName)
  if (typeof rawValue === 'string') {
    return JSON.parse(`[${rawValue}]`)
  }
  console.error(
    `Variable '${variableName}' is not defined properly, actual = ${rawValue} (typeof ${typeof rawValue}), expected = (typeof string)`
  )
  return []
}
export const setGrafanaVariable = (variableName: string, value: string) =>
  locationService.partial({ [`var-${variableName}`]: value }, true)

// Get/Set first four levels sorting variable
export const generateFirstFourLevelsSortingVariableValue = (optionIndices: OptionIndicesData): string => {
  // The DB is: Company | Operated(Type) | Continent | Country
  let levels = new Array(4).fill(0)
  levels[CONTINENT_DATABASE_INDEX] = toOneBased(optionIndices.continentIndex)
  levels[COUNTRY_DATABASE_INDEX] = toOneBased(optionIndices.countryIndex)
  levels[TYPE_DATABASE_INDEX] = toOneBased(optionIndices.typeIndex)
  levels[COMPANY_DATABASE_INDEX] = toOneBased(optionIndices.companyIndex)
  return levels.join(',')
}

// Get/Set tree filters variable
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
  return filters.toString()
}
