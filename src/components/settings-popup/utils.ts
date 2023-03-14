import { OptionData } from 'commons/types/OptionData'
import { COMPANY_OPTION, CONTINENT_OPTION, COUNTRY_OPTION, DETAIL_SETTING_OPTIONS, TYPE_OPTION } from './constants'

export const getGeneralSettingOptions = (typeIndex: number, companyIndex: number) => {
  if (typeIndex !== -1 && companyIndex !== -1) {
    switch (typeIndex) {
      case 0:
        switch (companyIndex) {
          case 1:
            return [TYPE_OPTION, COMPANY_OPTION, CONTINENT_OPTION, COUNTRY_OPTION]
          case 2:
            return [TYPE_OPTION, CONTINENT_OPTION, COMPANY_OPTION, COUNTRY_OPTION]
          case 3:
            return [TYPE_OPTION, CONTINENT_OPTION, COUNTRY_OPTION, COMPANY_OPTION]
        }
      case 1:
        switch (companyIndex) {
          case 0:
            return [COMPANY_OPTION, TYPE_OPTION, CONTINENT_OPTION, COUNTRY_OPTION]
          case 2:
            return [CONTINENT_OPTION, TYPE_OPTION, COMPANY_OPTION, COUNTRY_OPTION]
          case 3:
            return [CONTINENT_OPTION, TYPE_OPTION, COUNTRY_OPTION, COMPANY_OPTION]
        }
      case 2:
        switch (companyIndex) {
          case 0:
            return [COMPANY_OPTION, CONTINENT_OPTION, TYPE_OPTION, COUNTRY_OPTION]
          case 1:
            return [CONTINENT_OPTION, COMPANY_OPTION, TYPE_OPTION, COUNTRY_OPTION]
          case 3:
            return [CONTINENT_OPTION, COUNTRY_OPTION, TYPE_OPTION, COMPANY_OPTION]
        }
      case 3:
        switch (companyIndex) {
          case 0:
            return [COMPANY_OPTION, CONTINENT_OPTION, COUNTRY_OPTION, TYPE_OPTION]
          case 1:
            return [CONTINENT_OPTION, COMPANY_OPTION, COUNTRY_OPTION, TYPE_OPTION]
          case 2:
            return [CONTINENT_OPTION, COUNTRY_OPTION, COMPANY_OPTION, TYPE_OPTION]
        }
    }
  }
  return [CONTINENT_OPTION, COUNTRY_OPTION, TYPE_OPTION, COMPANY_OPTION]
}

export const getDetailSettingOptions = () => DETAIL_SETTING_OPTIONS

export const addDraggedClassNameIfOptionDragged = (
  dragItem: React.MutableRefObject<OptionData | null | undefined>,
  optionItem: OptionData
) => (isOptionDragged(dragItem, optionItem) ? 'dragged' : '')

export const isOptionDragged = (
  dragItem: React.MutableRefObject<OptionData | null | undefined>,
  optionItem: OptionData
) => dragItem.current?.id === optionItem.id
