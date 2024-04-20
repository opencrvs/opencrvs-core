/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Icon } from '../Icon'
import { PrimaryButton } from '../buttons'
import { InputError } from '../InputField/InputError'

const SEARCH_DEBOUNCE_DURATION = 300

const SearchButton = styled(PrimaryButton)`
  height: 40px;
  margin-left: 4px;
`
const LocationSearchContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`
const Wrapper = styled.div`
  align-items: center;
  display: flex;
  width: 344px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
  margin-bottom: 1px;
  position: relative;
  & svg {
    position: absolute;
    left: 8px;
  }
`
const SearchTextInput = styled.input<{ error?: boolean; touched?: boolean }>`
  width: 100%;
  height: 40px;
  border-radius: 4px;
  ${({ theme }) => theme.fonts.reg18};
  padding-left: 32px;
  border: 2px solid
    ${({ theme, error, touched }) =>
      error && touched ? theme.colors.negative : theme.colors.copy};

  &:focus {
    outline: none;
    box-shadow: 0 0 0px 3px ${({ theme }) => theme.colors.yellow};
  }
`
const DropDownWrapper = styled.ul`
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0px 2px 8px rgba(53, 67, 93, 0.54);
  border-radius: 4px;
  position: absolute;
  width: 100%;
  z-index: 9999;
  list-style: none;
  padding: 0px;
  top: 100%;
  left: 0px;
  margin-top: 4px;
  overflow-y: auto;
  cursor: pointer;
`
const DropDownItem = styled.li`
  display: flex;
  align-items: center;
  border-bottom: solid 1px ${({ theme }) => theme.colors.background};
  padding: 8px 16px;
  white-space: nowrap;
  cursor: pointer;
  &:nth-last-child {
    border-bottom: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
  }
`
const Label = styled.span`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};
`
export interface ISearchLocation {
  id: string
  searchableText: string
  displayLabel: string
}

interface IProps {
  locationList?: ISearchLocation[]
  selectedLocation?: ISearchLocation | undefined
  searchHandler?: (location: ISearchLocation) => void
  searchButtonHandler?: () => void
  id?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBlur?: (e: React.FocusEvent<any>) => void
  errorMessage?: string
  error?: boolean
  touched?: boolean
  className?: string
  buttonLabel: string
}
export const LocationSearch = ({
  locationList,
  selectedLocation,
  searchHandler,
  searchButtonHandler,
  id,
  onBlur,
  errorMessage,
  error,
  touched,
  className,
  buttonLabel
}: IProps) => {
  const [dropDownIsVisible, setDropDownIsVisible] = useState(false)
  const [filteredList, setFilteredList] = useState<ISearchLocation[]>([])
  const [selectedItem, setSelectedItem] = useState<ISearchLocation | null>(null)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  let searchTimeout: NodeJS.Timeout | undefined = undefined

  const handler = () => {
    document.removeEventListener('click', handler)
    setDropDownIsVisible(false)
  }

  useEffect(() => {
    if (selectedLocation) {
      setSelectedText(selectedLocation.displayLabel)
      setSelectedItem(selectedLocation)
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      document.removeEventListener('click', handler)
    }
  }, [selectedLocation, handler, searchTimeout])

  const search = (searchText: string) => {
    const searchResult = [] as ISearchLocation[]
    if (searchText && locationList) {
      for (const location of locationList) {
        if (searchResult.length === 10) {
          break
        }
        if (
          location.displayLabel &&
          location.displayLabel
            .toLowerCase()
            .startsWith(searchText.toLowerCase())
        ) {
          searchResult.push(location)
        }
      }
    }
    if (
      searchResult.length === 0 ||
      (selectedItem && selectedText !== selectedItem.displayLabel)
    ) {
      setSelectedItem(null)
    }

    setFilteredList(searchResult)
    setDropDownIsVisible(searchResult.length > 0)
  }

  const debounce = (callback: () => void, duration: number) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(callback, duration)
  }

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    setSelectedText(text)
    debounce(() => search(text), SEARCH_DEBOUNCE_DURATION)
  }

  const onBlurHandler = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    if (onBlur && searchHandler) {
      searchHandler({
        id: selectedText ? '0' : '',
        searchableText: selectedText || '',
        displayLabel: selectedText || ''
      })
      onBlur(event)
    }
  }

  const onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    setTimeout(event.target.select.bind(event.target), 20)
    if (selectedItem && selectedText === selectedItem.displayLabel) {
      return search(selectedItem.searchableText)
    }
    search(selectedText || '')
  }

  const dropDownItemSelect = (item: ISearchLocation) => {
    if (searchHandler) {
      searchHandler(item)
    }

    setDropDownIsVisible(false)
    setSelectedItem(item)
    setSelectedText(item.displayLabel)
  }

  const dropdown = () => {
    return (
      dropDownIsVisible && (
        <DropDownWrapper>
          {filteredList.map((item) => {
            return (
              <DropDownItem
                id={`locationOption${item.id}`}
                key={item.id}
                onClick={() => dropDownItemSelect(item)}
              >
                <Label>{item.displayLabel}</Label>
              </DropDownItem>
            )
          })}
        </DropDownWrapper>
      )
    )
  }

  return (
    <>
      <LocationSearchContainer>
        <Wrapper className={className}>
          <Icon name="MapPin" size="medium" />
          <SearchTextInput
            id={id ? id : 'locationSearchInput'}
            type="text"
            autoComplete="off"
            onFocus={onFocus}
            onBlur={onBlurHandler}
            onClick={() =>
              //https://github.com/facebook/react/issues/24657#issuecomment-1150119055
              setTimeout(() => document.addEventListener('click', handler), 0)
            }
            value={selectedText || ''}
            onChange={onChangeHandler}
            error={error}
            touched={touched}
          />
          {dropdown()}
        </Wrapper>
        {searchButtonHandler && (
          <SearchButton
            id="location-search-btn"
            onClick={searchButtonHandler}
            disabled={!(selectedItem && selectedText)}
          >
            {buttonLabel}
          </SearchButton>
        )}
      </LocationSearchContainer>
      {!selectedItem && selectedText && errorMessage && !isFocused && (
        <InputError id="location-search-error">{errorMessage}</InputError>
      )}
    </>
  )
}
