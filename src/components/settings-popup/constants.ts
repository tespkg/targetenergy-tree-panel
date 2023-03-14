import { OptionData } from 'commons/types/OptionData'

// Option Ids
export const CONTINENT_OPTION_ID = 'continent'
export const COUNTRY_OPTION_ID = 'country'
export const TYPE_OPTION_ID = 'type'
export const COMPANY_OPTION_ID = 'company'
export const BLOCK_OPTION_ID = 'block'
export const FIELD_OPTION_ID = 'field'
export const WELL_OPTION_ID = 'well'

// Default Option Positions
export const CONTINENT_OPTION_DEFAULT_CHECKED_VALUE = true
export const COUNTRY_OPTION_DEFAULT_CHECKED_VALUE = true
export const TYPE_OPTION_DEFAULT_CHECKED_VALUE = true
export const COMPANY_OPTION_DEFAULT_CHECKED_VALUE = true
export const BLOCK_OPTION_DEFAULT_CHECKED_VALUE = true
export const FIELD_OPTION_DEFAULT_CHECKED_VALUE = true
export const WELL_OPTION_DEFAULT_CHECKED_VALUE = true
export const TYPE_OPTION_DEFAULT_CHECKED_INDEX = 2
export const COMPANY_OPTION_DEFAULT_CHECKED_INDEX = 3

// General Setting Options
export const CONTINENT_OPTION: OptionData = { id: CONTINENT_OPTION_ID, label: 'Continent', isDraggable: false }
export const COUNTRY_OPTION: OptionData = { id: COUNTRY_OPTION_ID, label: 'Country', isDraggable: false }
export const TYPE_OPTION: OptionData = { id: TYPE_OPTION_ID, label: 'Type', isDraggable: true }
export const COMPANY_OPTION: OptionData = { id: COMPANY_OPTION_ID, label: 'Company', isDraggable: true }

// Detail Setting Options
export const DETAIL_SETTING_OPTIONS: OptionData[] = [
  { id: BLOCK_OPTION_ID, label: 'Block', isDraggable: false },
  { id: FIELD_OPTION_ID, label: 'Field', isDraggable: false },
  { id: WELL_OPTION_ID, label: 'Well', isDraggable: false },
]
