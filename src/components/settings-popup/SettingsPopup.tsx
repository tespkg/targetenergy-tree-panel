import React from 'react'
import GearSvg from 'img/gear.svg'
import Popup from 'reactjs-popup'
import { Button, Checkbox } from '@grafana/ui'
import * as Constants from './constants'
import * as Utils from './utils'
import FancyCheckbox from 'components/fancy-checkbox/FancyCheckbox'
import HorizontalSeparator from 'components/horizontal-separator/HorizontalSeparator'
import { OptionData } from 'commons/types/OptionData'
import DraggableSvg from 'img/draggable.svg'
import { cx } from '@emotion/css'
import * as GrafanaVariableUtils from 'commons/utils/grafana-variable-utils'
import * as DatabaseConstants from 'commons/constants/database-constants'
import { getTemplateSrv } from '@grafana/runtime'
import './style.css'

type SettingsPopupProps = {
  firstFourLevelsSortingVariableName: string
  treeFiltersVariableName: string
  onExpandAll: () => void
  onCollapseAll: () => void
  showSelected: boolean
  onShowSelectedChange: () => void
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({
  firstFourLevelsSortingVariableName,
  treeFiltersVariableName,
  onExpandAll,
  onCollapseAll,
  showSelected,
  onShowSelectedChange,
}) => {
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

  const grafanaVariables = JSON.stringify(getTemplateSrv().getVariables())

  const firstFourLevelsSortingValue = React.useMemo(
    () => GrafanaVariableUtils.getGrafanaVariableAsNumberArray(firstFourLevelsSortingVariableName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grafanaVariables]
  )

  const treeFiltersValue = React.useMemo(
    () => GrafanaVariableUtils.getGrafanaVariableAsNumberArray(treeFiltersVariableName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grafanaVariables]
  )

  const onDragStart = (event: React.DragEvent<HTMLElement>, optionItem: OptionData) => {
    dragItem.current = optionItem
  }

  const onDragEnter = (event: React.DragEvent<HTMLElement>, position: number) => {
    dragOverItem.current = position
  }

  const allowDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault()
  }

  const onDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault()
    const newOptionIndex = dragOverItem.current
    if (dragItem.current?.id === Constants.TYPE_OPTION_ID) {
      if (newOptionIndex === companyOptionIndex) {
        if (typeOptionIndex < companyOptionIndex) {
          setCompanyOptionIndex(newOptionIndex - 1)
        } else {
          setCompanyOptionIndex(newOptionIndex + 1)
        }
      }
      setTypeOptionIndex(newOptionIndex ?? Constants.TYPE_OPTION_DEFAULT_CHECKED_INDEX)
    } else if (dragItem.current?.id === Constants.COMPANY_OPTION_ID) {
      if (newOptionIndex === typeOptionIndex) {
        if (companyOptionIndex < typeOptionIndex) {
          setTypeOptionIndex(newOptionIndex - 1)
        } else {
          setTypeOptionIndex(newOptionIndex + 1)
        }
      }
      setCompanyOptionIndex(newOptionIndex ?? Constants.COMPANY_OPTION_DEFAULT_CHECKED_INDEX)
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
      const newFirstFourLevelsSortingValue =
        GrafanaVariableUtils.generateFirstFourLevelsSortingVariableValue(optionIndices)
      GrafanaVariableUtils.setGrafanaVariable(firstFourLevelsSortingVariableName, newFirstFourLevelsSortingValue)
      const newTreeFiltersValue = GrafanaVariableUtils.generateTreeFiltersVariableValue(optionIndices, optionChecks)
      GrafanaVariableUtils.setGrafanaVariable(treeFiltersVariableName, newTreeFiltersValue)
    },
    [typeOptionIndex, companyOptionIndex, optionChecks, firstFourLevelsSortingVariableName, treeFiltersVariableName]
  )

  React.useEffect(() => {
    // The DB is: Company | Operated(Type) | Continent | Country
    const optionIndices = Utils.getOptionIndices(firstFourLevelsSortingValue)
    setTypeOptionIndex(optionIndices.typeIndex)
    setCompanyOptionIndex(optionIndices.companyIndex)
  }, [firstFourLevelsSortingValue])

  React.useEffect(() => {
    const optionIndices = Utils.getOptionIndices(firstFourLevelsSortingValue)
    // Convert it to boolean[]
    const toBoolean = (v: number) => v === 1
    const treeFilters: boolean[] = treeFiltersValue.map(toBoolean)
    setOptionChecks((prev) => {
      return {
        ...prev,
        // Set general options checked
        continentChecked: treeFilters[optionIndices.continentIndex],
        countryChecked: treeFilters[optionIndices.countryIndex],
        typeChecked: treeFilters[optionIndices.typeIndex],
        companyChecked: treeFilters[optionIndices.companyIndex],
        // Set detail options checked
        blockChecked: treeFilters[DatabaseConstants.BLOCK_DATABASE_INDEX],
        fieldChecked: treeFilters[DatabaseConstants.FIELD_DATABASE_INDEX],
        wellChecked: treeFilters[DatabaseConstants.WELL_DATABASE_INDEX],
      }
    })
  }, [firstFourLevelsSortingValue, treeFiltersValue])

  return (
    <Popup
      trigger={
        <Button className="tpp--button image" size="sm">
          <img src={GearSvg} alt="Tree Settings" />
        </Button>
      }
      position="bottom right"
      onClose={onPopupClose}
    >
      <div className="tpp-settings-popup--popup-container">
        <div className="tpp-settings-popup--general-options-container" onDragOver={allowDrop}>
          {Utils.getGeneralSettingOptions(typeOptionIndex, companyOptionIndex).map((optionItem, index) => {
            const checked = getCheckForOptionId(optionChecks, optionItem.id)
            return optionItem.isDraggable ? (
              <div
                className={cx(
                  'tpp-settings-popup--draggable-container',
                  Utils.addDraggedClassNameIfOptionDragged(dragItem, optionItem)
                )}
                key={optionItem.id}
                onDragStart={(e) => onDragStart(e, optionItem)}
                onDragEnter={(e) => onDragEnter(e, index)}
                onDragEnd={onDrop}
                draggable={true}
              >
                <img src={DraggableSvg} alt="Draggable Area" className="tpp-settings-popup--draggable-area" />
                <div className="tpp-settings-popup--draggable-content">
                  {createFancyCheckbox(optionItem, checked, onCheckboxChange)}
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
                onDragEnd={onDrop}
              >
                {createFancyCheckbox(optionItem, checked, onCheckboxChange)}
              </div>
            )
          })}
        </div>
        <HorizontalSeparator />
        {Utils.getDetailSettingOptions().map((optionItem) => (
          <div
            className={cx(
              'tpp-settings-popup--unmovable-container',
              Utils.addDraggedClassNameIfOptionDragged(dragItem, optionItem)
            )}
            key={optionItem.id}
          >
            {createFancyCheckbox(optionItem, getCheckForOptionId(optionChecks, optionItem.id), onCheckboxChange)}
          </div>
        ))}
        <HorizontalSeparator />
        <div className="tpp-settings-popup--extra-options-container">
          <Checkbox
            className="tpp--checkbox"
            value={showSelected}
            label="Show Selected"
            onChange={onShowSelectedChange}
          />
          <Button className="tpp--button primary" size="sm" onClick={onExpandAll}>
            Expand All
          </Button>
          <Button className="tpp--button primary" size="sm" onClick={onCollapseAll}>
            Collapse All
          </Button>
        </div>
      </div>
    </Popup>
  )
}

export default SettingsPopup

const getCheckForOptionId = (optionChecks: OptionChecksData, optionId: string): boolean => {
  switch (optionId) {
    case Constants.CONTINENT_OPTION_ID:
      return optionChecks.continentChecked
    case Constants.COUNTRY_OPTION_ID:
      return optionChecks.countryChecked
    case Constants.TYPE_OPTION_ID:
      return optionChecks.typeChecked
    case Constants.COMPANY_OPTION_ID:
      return optionChecks.companyChecked
    case Constants.BLOCK_OPTION_ID:
      return optionChecks.blockChecked
    case Constants.FIELD_OPTION_ID:
      return optionChecks.fieldChecked
    case Constants.WELL_OPTION_ID:
      return optionChecks.wellChecked
  }
  return false
}

const createFancyCheckbox = (
  optionItem: OptionData,
  checked: boolean,
  onCheckboxChange: (optionId: string) => void
) => (
  <FancyCheckbox title={optionItem.label} defaultChecked={checked} onChange={() => onCheckboxChange(optionItem.id)} />
)
