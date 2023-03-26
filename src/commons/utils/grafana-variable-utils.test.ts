import { generateFirstFourLevelsSortingVariableValue, generateTreeFiltersVariableValue } from './grafana-variable-utils'

describe('grafana-variable-utils test', () => {
  it('generateFirstFourLevelsSortingVariableValue', () => {
    expect(
      generateFirstFourLevelsSortingVariableValue({
        continentIndex: 2,
        countryIndex: 3,
        typeIndex: 1,
        companyIndex: 0,
      })
    ).toBe('1,2,3,4')
    expect(
      generateFirstFourLevelsSortingVariableValue({
        continentIndex: 2,
        countryIndex: 3,
        typeIndex: 0,
        companyIndex: 1,
      })
    ).toBe('2,1,3,4')
    expect(
      generateFirstFourLevelsSortingVariableValue({
        continentIndex: 0,
        countryIndex: 1,
        typeIndex: 3,
        companyIndex: 2,
      })
    ).toBe('3,4,1,2')
    expect(
      generateFirstFourLevelsSortingVariableValue({
        continentIndex: 1,
        countryIndex: 2,
        typeIndex: 0,
        companyIndex: 3,
      })
    ).toBe('2,3,4,1')
  })
})

describe('grafana-variable-utils test', () => {
  it('generateTreeFiltersVariableValue', () => {
    expect(
      generateTreeFiltersVariableValue(
        {
          continentIndex: 2,
          countryIndex: 3,
          typeIndex: 1,
          companyIndex: 0,
        },
        {
          continentChecked: true,
          countryChecked: true,
          typeChecked: true,
          companyChecked: true,
          regionChecked: true,
          blockChecked: true,
          productionStationChecked: true,
          fieldChecked: true,
          reservoirChecked: true,
          wellChecked: true,
          completionChecked: true,
        }
      )
    ).toBe('1,1,1,1,1,1,1,1,1,1,1')
    expect(
      generateTreeFiltersVariableValue(
        {
          continentIndex: 2,
          countryIndex: 3,
          typeIndex: 0,
          companyIndex: 1,
        },
        {
          continentChecked: false,
          countryChecked: true,
          typeChecked: false,
          companyChecked: true,
          regionChecked: true,
          blockChecked: true,
          productionStationChecked: true,
          fieldChecked: true,
          reservoirChecked: true,
          wellChecked: true,
          completionChecked: false,
        }
      )
    ).toBe('0,1,0,1,1,1,1,1,1,1,0')
  })
})
