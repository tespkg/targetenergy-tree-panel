import { generateOptionIndices, getOptionIndices } from './utils'

describe('utils test', () => {
  it('getOptionIndices', () => {
    expect(getOptionIndices([1, 2, 3, 4])).toEqual({
      companyIndex: 0,
      typeIndex: 1,
      continentIndex: 2,
      countryIndex: 3,
    })
    expect(getOptionIndices([2, 1, 3, 4])).toEqual({
      companyIndex: 1,
      typeIndex: 0,
      continentIndex: 2,
      countryIndex: 3,
    })
    expect(getOptionIndices([3, 4, 1, 2])).toEqual({
      companyIndex: 2,
      typeIndex: 3,
      continentIndex: 0,
      countryIndex: 1,
    })
    expect(getOptionIndices([2, 3, 1, 4])).toEqual({
      companyIndex: 1,
      typeIndex: 2,
      continentIndex: 0,
      countryIndex: 3,
    })
  })
  it('generateOptionIndices', () => {
    expect(generateOptionIndices(2, 3)).toEqual({ continentIndex: 0, countryIndex: 1, typeIndex: 2, companyIndex: 3 })
    expect(generateOptionIndices(0, 2)).toEqual({ continentIndex: 1, countryIndex: 3, typeIndex: 0, companyIndex: 2 })
    expect(generateOptionIndices(3, 1)).toEqual({ continentIndex: 0, countryIndex: 2, typeIndex: 3, companyIndex: 1 })
    expect(generateOptionIndices(1, 0)).toEqual({ continentIndex: 2, countryIndex: 3, typeIndex: 1, companyIndex: 0 })
  })
})
