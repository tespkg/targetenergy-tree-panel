import React from 'react'
import GearSvg from 'img/gear.svg'
import Popup from 'reactjs-popup'
import { Button } from '@grafana/ui'
import * as Constants from './constants'
import * as Utils from './utils'
import FancyCheckbox from 'components/fancy-checkbox/FancyCheckbox'
import HorizontalSeparator from 'components/horizontal-separator/HorizontalSeparator'
import { OptionData } from 'commons/types/OptionData'
import DraggableSvg from 'img/draggable.svg'
import { cx } from '@emotion/css'
import * as GrafanaVariableUtils from 'commons/utils/grafana-variable-utils'
import * as DatabaseConstants from 'commons/constants/database-constants'
import './style.css'

type SettingsPopupProps = {}

const SettingsPopup: React.FC<SettingsPopupProps> = ({}) => {
  const dragItem = React.useRef<OptionData | null>()
  const dragOverItem = React.useRef<number | null>()

  const [optionChecks, setOptionChecks] = React.useState<OptionChecksData>({
    continentChecked: Constants.CONTINENT_OPTION_DEFAULT_CHECKED_VALUE,
    countryChecked: Constants.COUNTRY_OPTION_DEFAULT_CHECKED_VALUE,
    typeChecked: Constants.TYPE_OPTION_DEFAULT_CHECKED_VALUE,
    companyChecked: Constants.COMPANY_OPTION_DEFAULT_CHECKED_VALUE,
    regionChecked: Constants.REGION_OPTION_DEFAULT_CHECKED_VALUE,
    blockChecked: Constants.BLOCK_OPTION_DEFAULT_CHECKED_VALUE,
    productionStationChecked: Constants.PRODUCTION_STATION_OPTION_DEFAULT_CHECKED_VALUE,
    fieldChecked: Constants.FIELD_OPTION_DEFAULT_CHECKED_VALUE,
    reservoirChecked: Constants.RESERVOIR_OPTION_DEFAULT_CHECKED_VALUE,
    wellChecked: Constants.WELL_OPTION_DEFAULT_CHECKED_VALUE,
    completionChecked: Constants.COMPLETION_OPTION_DEFAULT_CHECKED_VALUE,
  })
  const [typeOptionIndex, setTypeOptionIndex] = React.useState(Constants.TYPE_OPTION_DEFAULT_CHECKED_INDEX)
  const [companyOptionIndex, setCompanyOptionIndex] = React.useState(Constants.COMPANY_OPTION_DEFAULT_CHECKED_INDEX)

  const firstFourLevelsSortingAsJson = React.useMemo(
    () => GrafanaVariableUtils.getFirstFourLevelsSortingVariableAsJson(),
    []
  )
  const treeFiltersAsJson = React.useMemo(() => GrafanaVariableUtils.getTreeFiltersVariableAsJson(), [])

  const onDragStart = (event: React.DragEvent<HTMLElement>, optionItem: OptionData) => {
    dragItem.current = optionItem
  }

  const onDragEnter = (event: React.DragEvent<HTMLElement>, position: number) => {
    dragOverItem.current = position
  }

  const onDrop = (event: React.DragEvent<HTMLElement>) => {
    if (dragItem.current?.id === Constants.TYPE_OPTION_ID) {
      setTypeOptionIndex(dragOverItem.current ?? Constants.TYPE_OPTION_DEFAULT_CHECKED_INDEX)
    } else if (dragItem.current?.id === Constants.COMPANY_OPTION_ID) {
      setCompanyOptionIndex(dragOverItem.current ?? Constants.COMPANY_OPTION_DEFAULT_CHECKED_INDEX)
    }
    dragItem.current = null
    dragOverItem.current = null
  }

  const onCheckboxChange = React.useCallback((optionId: string) => {
    switch (optionId) {
      case Constants.CONTINENT_OPTION_ID:
        setOptionChecks((prev) => {
          return { ...prev, continentChecked: !prev.continentChecked }
        })
        break
      case Constants.COUNTRY_OPTION_ID:
        setOptionChecks((prev) => {
          return { ...prev, countryChecked: !prev.countryChecked }
        })
        break
      case Constants.TYPE_OPTION_ID:
        setOptionChecks((prev) => {
          return { ...prev, typeChecked: !prev.typeChecked }
        })
        break
      case Constants.COMPANY_OPTION_ID:
        setOptionChecks((prev) => {
          return { ...prev, companyChecked: !prev.companyChecked }
        })
        break
      case Constants.BLOCK_OPTION_ID:
        setOptionChecks((prev) => {
          return { ...prev, blockChecked: !prev.blockChecked }
        })
        break
      case Constants.FIELD_OPTION_ID:
        setOptionChecks((prev) => {
          return { ...prev, fieldChecked: !prev.fieldChecked }
        })
        break
      case Constants.WELL_OPTION_ID:
        setOptionChecks((prev) => {
          return { ...prev, wellChecked: !prev.wellChecked }
        })
        break
    }
  }, [])

  const onPopupClose = React.useCallback(
    (event?: React.SyntheticEvent<Element, Event> | MouseEvent | KeyboardEvent | TouchEvent | undefined) => {
      const optionIndices = Utils.generateOptionIndices(typeOptionIndex, companyOptionIndex)
      GrafanaVariableUtils.setFirstFourLevelsSortingVariable(
        GrafanaVariableUtils.generateFirstFourLevelsSortingVariableValue(optionIndices)
      )
      GrafanaVariableUtils.setTreeFiltersVariable(
        GrafanaVariableUtils.generateTreeFiltersVariableValue(optionIndices, optionChecks)
      )
    },
    [typeOptionIndex, companyOptionIndex, optionChecks]
  )

  React.useEffect(() => {
    // The DB is: Company | Operated(Type) | Continent | Country
    const [, , typeIndex, companyIndex] = Utils.getOptionIndices(firstFourLevelsSortingAsJson)
    setTypeOptionIndex(typeIndex)
    setCompanyOptionIndex(companyIndex)
  }, [firstFourLevelsSortingAsJson])

  React.useEffect(() => {
    const [continentIndex, countryIndex, typeIndex, companyIndex] = Utils.getOptionIndices(firstFourLevelsSortingAsJson)
    // Convert it to boolean[]
    const toBoolean = (v: number) => v === 1
    const treeFilters: boolean[] = JSON.parse(treeFiltersAsJson).map(toBoolean)
    setOptionChecks((prev) => {
      return {
        ...prev,
        // Set general options checked
        continentChecked: treeFilters[continentIndex],
        countryChecked: treeFilters[countryIndex],
        typeChecked: treeFilters[typeIndex],
        companyChecked: treeFilters[companyIndex],
        // Set detail options checked
        blockChecked: treeFilters[DatabaseConstants.BLOCK_DATABASE_INDEX],
        fieldChecked: treeFilters[DatabaseConstants.FIELD_DATABASE_INDEX],
        wellChecked: treeFilters[DatabaseConstants.WELL_DATABASE_INDEX],
      }
    })
  }, [firstFourLevelsSortingAsJson, treeFiltersAsJson])

  return (
    <Popup
      trigger={
        <Button className="tpp--button image" size="sm">
          <img src={GearSvg} alt="Tree Settings" />
        </Button>
      }
      position="bottom left"
      onClose={onPopupClose}
    >
      <div className="tpp-settings-popup--popup-container">
        {Utils.getGeneralSettingOptions(typeOptionIndex, companyOptionIndex).map((optionItem, index) =>
          optionItem.isDraggable ? (
            <div
              className={cx(
                'tpp-settings-popup--draggable-container',
                Utils.addDraggedClassNameIfOptionDragged(dragItem, optionItem)
              )}
              key={optionItem.id}
              onDragStart={(e) => onDragStart(e, optionItem)}
              onDragEnter={(e) => onDragEnter(e, index)}
              onDragEnd={(e) => onDrop(e)}
              draggable={true}
            >
              <img src={DraggableSvg} alt="Draggable Area" className="tpp-settings-popup--draggable-area" />
              <div className="tpp-settings-popup--draggable-content">
                {createFancyCheckbox(optionItem, onCheckboxChange)}
              </div>
            </div>
          ) : (
            <div
              className={cx(
                'tpp-settings-popup--unmovable-container',
                Utils.addDraggedClassNameIfOptionDragged(dragItem, optionItem)
              )}
              key={optionItem.id}
              onDragEnter={(e) => onDragEnter(e, index)}
              onDragEnd={(e) => onDrop(e)}
            >
              {createFancyCheckbox(optionItem, onCheckboxChange)}
            </div>
          )
        )}
        <HorizontalSeparator />
        {Utils.getDetailSettingOptions().map((optionItem) => (
          <div
            className={cx(
              'tpp-settings-popup--unmovable-container',
              Utils.addDraggedClassNameIfOptionDragged(dragItem, optionItem)
            )}
            key={optionItem.id}
          >
            {createFancyCheckbox(optionItem, onCheckboxChange)}
          </div>
        ))}
      </div>
    </Popup>
  )
}

export default SettingsPopup

const createFancyCheckbox = (optionItem: OptionData, onCheckboxChange: (optionId: string) => void) => (
  <FancyCheckbox title={optionItem.label} defaultChecked={true} onChange={() => onCheckboxChange(optionItem.id)} />
)
