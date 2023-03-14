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
import './style.css'
import { cx } from '@emotion/css'

type SettingsPopupProps = {}

const SettingsPopup: React.FC<SettingsPopupProps> = ({}) => {
  const dragItem = React.useRef<OptionData | null>()
  const dragOverItem = React.useRef<number | null>()

  const [isContinentOptionChecked, setContinentOptionChecked] = React.useState(
    Constants.CONTINENT_OPTION_DEFAULT_CHECKED_VALUE
  )
  const [isCountryOptionChecked, setCountryOptionChecked] = React.useState(
    Constants.COUNTRY_OPTION_DEFAULT_CHECKED_VALUE
  )
  const [isTypeOptionChecked, setTypeOptionChecked] = React.useState(Constants.TYPE_OPTION_DEFAULT_CHECKED_VALUE)
  const [isCompanyOptionChecked, setCompanyOptionChecked] = React.useState(
    Constants.COMPANY_OPTION_DEFAULT_CHECKED_VALUE
  )
  const [isBlockOptionChecked, setBlockOptionChecked] = React.useState(Constants.BLOCK_OPTION_DEFAULT_CHECKED_VALUE)
  const [isFieldOptionChecked, setFieldOptionChecked] = React.useState(Constants.FIELD_OPTION_DEFAULT_CHECKED_VALUE)
  const [isWellOptionChecked, setWellOptionChecked] = React.useState(Constants.WELL_OPTION_DEFAULT_CHECKED_VALUE)
  const [typeOptionIndex, setTypeOptionIndex] = React.useState(Constants.TYPE_OPTION_DEFAULT_CHECKED_INDEX)
  const [companyOptionIndex, setCompanyOptionIndex] = React.useState(Constants.COMPANY_OPTION_DEFAULT_CHECKED_INDEX)

  console.debug(
    isContinentOptionChecked,
    isCountryOptionChecked,
    isTypeOptionChecked,
    isCompanyOptionChecked,
    isBlockOptionChecked,
    isFieldOptionChecked,
    isWellOptionChecked
  )

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
        setContinentOptionChecked((prev) => !prev)
        break
      case Constants.COUNTRY_OPTION_ID:
        setCountryOptionChecked((prev) => !prev)
        break
      case Constants.TYPE_OPTION_ID:
        setTypeOptionChecked((prev) => !prev)
        break
      case Constants.COMPANY_OPTION_ID:
        setCompanyOptionChecked((prev) => !prev)
        break
      case Constants.BLOCK_OPTION_ID:
        setBlockOptionChecked((prev) => !prev)
        break
      case Constants.FIELD_OPTION_ID:
        setFieldOptionChecked((prev) => !prev)
        break
      case Constants.WELL_OPTION_ID:
        setWellOptionChecked((prev) => !prev)
        break
    }
  }, [])

  return (
    <Popup
      trigger={
        <Button className="tpp--button image" size="sm">
          <img src={GearSvg} alt="Tree Settings" />
        </Button>
      }
      position="bottom right"
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
