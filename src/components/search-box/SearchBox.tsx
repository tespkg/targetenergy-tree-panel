import { css } from '@emotion/css'
import { Input } from '@grafana/ui'
import { debounce } from 'lodash'
import React, { useCallback } from 'react'

export type Props = {
  onDebouncedChange: (value: string) => void
}

export const SearchBox: React.FC<Props> = ({ onDebouncedChange }: Props) => {
  const [searchText, setSearchText] = React.useState('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleChange = useCallback(debounce(onDebouncedChange, 250), [onDebouncedChange])

  return (
    <Input
      label="Search"
      placeholder="Search"
      value={searchText}
      title="wildcard supported"
      onChange={(e) => {
        const value = e.currentTarget.value
        setSearchText(value)
        handleChange(value)
      }}
      className={css`
        margin-bottom: 8px;
      `}
    />
  )
}
