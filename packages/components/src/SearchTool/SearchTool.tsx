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
import { ClearText } from '../icons'
import { Button } from '../Button'
import { Icon } from '../Icon'
import styled from 'styled-components'

type SearchCriterias =
  | 'TRACKING_ID'
  | 'REGISTRATION_NUMBER'
  | 'NATIONAL_ID'
  | 'NAME'
  | 'PHONE_NUMBER'
  | 'EMAIL'

const SearchBox = styled.div`
  background: ${({ theme }) => theme.colors.grey100};
  box-sizing: border-box;
  width: 664px;
  height: 40px;
  border-radius: 40px;

  &:hover {
    outline: 1px solid ${({ theme }) => theme.colors.grey400};
    background: ${({ theme }) => theme.colors.grey100};
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.grey600};
    background: ${({ theme }) => theme.colors.white};
  }

  &:active {
    outline: 2px solid ${({ theme }) => theme.colors.grey600};
  }

  &:focus-within input {
    background: ${({ theme }) => theme.colors.white};
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
    width: 100%;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
    margin: auto;
  }
`

const Wrapper = styled.form`
  align-items: center;
  border-radius: 2px;
  display: flex;
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0px 8px 0px 4px;
  position: relative;
`
const SearchInput = styled.input`
  border: none;
  margin: 0px 4px;
  ${({ theme }) => theme.fonts.reg16};
  background-color: transparent;
  flex-grow: 1;
  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.colors.white};
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0px 4px;
    width: 40%;
  }
`
export const LabelButton = styled(Button)`
  width: auto;
  height: auto;
  border-radius: 2px;
  color: ${({ theme }) => theme.colors.primary};
  ${({ theme }) => theme.fonts.bold14};
`

const DropDownWrapper = styled.ul`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  ${({ theme }) => theme.shadows.light};
  position: absolute;
  padding: 6px 0;
  min-width: 200px;
  z-index: 9999;
  list-style: none;
  top: 100%;
  right: 0px;
  margin: 4px 0px;
  cursor: pointer;
`

const DropDownItem = styled.li`
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ theme }) => theme.colors.grey500};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin: 0 6px;
  border-radius: 4px;
  padding: 8px 12px;
  &:hover {
    color: ${({ theme }) => theme.colors.grey600};
    background: ${({ theme }) => theme.colors.grey100};
  }
  &:active {
    color: ${({ theme }) => theme.colors.grey600};
    background: ${({ theme }) => theme.colors.grey200};
  }

  &:focus-visible {
    background-color: ${({ theme }) => theme.colors.yellow};
  }
`

const AdvancedSearchWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-flow: column nowrap;
  align-items: stretch;
  margin-top: 6px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey300};
  padding: 6px;
  padding-bottom: 0;
`

const SelectedSearchCriteria = styled.span`
  display: flex;
  margin-right: 16px;
  &:hover:enabled {
    background: none;
  }
  & .selected-icon {
    display: none;
    margin-right: 8px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-right: 0;
    & .selected-icon {
      display: flex;
    }
    & .selected-label {
      display: none;
    }
  }
`
const DropDown = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: auto;
  }
`
const ClearTextIcon = styled((props) => <ClearText {...props} />)`
  margin: 0 12px;
`
export interface ISearchType {
  name: SearchCriterias // name is used to check default search field
  label: string
  icon: React.ReactNode
  placeHolderText: string
}
export interface INavigationType {
  label: string
  id: string
  icon?: React.ReactNode
  onClick: () => void
}

export interface ISearchToolProps {
  searchTypeList: ISearchType[]
  navigationList?: INavigationType[]
  searchText?: string
  selectedSearchType?: string
  language: string
  searchHandler: (searchText: string, searchType: string) => void
  onClearText?: () => void
  className?: string
}

export const SearchTool = ({
  searchTypeList,
  navigationList,
  searchText = '',
  selectedSearchType: initialSelectedSearchType,
  language,
  searchHandler,
  onClearText,
  className
}: ISearchToolProps) => {
  const getDefaultSearchType = (): ISearchType => {
    if (initialSelectedSearchType) {
      return (
        searchTypeList.find(
          (item: ISearchType) => item.name === initialSelectedSearchType
        ) || searchTypeList[0]
      )
    }
    return searchTypeList[0]
  }

  const [dropDownIsVisible, setDropDownIsVisible] = useState(false)
  const [searchParam, setSearchParam] = useState(searchText)
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const [selectedSearchType, setSelectedSearchType] = useState(() =>
    getDefaultSearchType()
  )

  useEffect(() => {
    if (language !== currentLanguage) {
      const newSelectedSearchType = searchTypeList.find(
        (item) => item.name === selectedSearchType.name
      )
      setSelectedSearchType(newSelectedSearchType || searchTypeList[0])
      setCurrentLanguage(language)
    }
  }, [language, searchTypeList, selectedSearchType.name, currentLanguage])

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    return searchParam && searchHandler(searchParam, selectedSearchType.name)
  }
  const dropdown = () => {
    return (
      dropDownIsVisible && (
        <DropDownWrapper>
          {searchTypeList.map((item) => {
            return (
              <DropDownItem
                id={item.name}
                key={item.name}
                onClick={() => dropDownItemSelect(item)}
              >
                {item.icon}
                {item.label}
              </DropDownItem>
            )
          })}
          {navigationList?.map((item) => {
            return (
              <AdvancedSearchWrapper key={item.id}>
                <Button
                  id={item.id}
                  type="tertiary"
                  size="small"
                  onClick={() => item.onClick()}
                >
                  {item.label}
                </Button>
              </AdvancedSearchWrapper>
            )
          })}
        </DropDownWrapper>
      )
    )
  }

  const dropDownItemSelect = (item: ISearchType) => {
    setSelectedSearchType(item)
    setDropDownIsVisible(false)
  }

  const toggleDropdownDisplay = () => {
    const handler = () => {
      setDropDownIsVisible(false)
      document.removeEventListener('click', handler)
    }
    if (!dropDownIsVisible) {
      //https://github.com/facebook/react/issues/24657#issuecomment-1150119055
      setTimeout(() => document.addEventListener('click', handler), 0)
    }
    setDropDownIsVisible(!dropDownIsVisible)
  }

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParam(event.target.value)
    setDropDownIsVisible(false)
  }

  const onClearTextHandler = () => {
    setSearchParam('')

    if (onClearText) {
      onClearText()
    }
  }

  const { placeHolderText, name } = selectedSearchType
  return (
    <SearchBox className={className}>
      <Wrapper onSubmit={search}>
        <Button
          type="icon"
          size="medium"
          aria-label="Search"
          id="searchIconButton"
          onClick={search}
        >
          <Icon color="currentColor" name="MagnifyingGlass" size="large" />
        </Button>
        <SearchInput
          id="searchText"
          type={name === 'PHONE_NUMBER' ? 'tel' : 'text'}
          autoComplete="off"
          placeholder={placeHolderText}
          onChange={onChangeHandler}
          value={searchParam}
          maxLength={200}
        />
        {searchParam && <ClearTextIcon onClick={onClearTextHandler} />}
        <DropDown id="searchType" onClick={toggleDropdownDisplay}>
          <SelectedSearchCriteria>
            <span className="selected-icon">{selectedSearchType.icon}</span>
            <span className="selected-label">{selectedSearchType.label}</span>
          </SelectedSearchCriteria>
        </DropDown>
        {dropdown()}
      </Wrapper>
    </SearchBox>
  )
}
