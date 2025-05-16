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
import React, { useState } from 'react'
import styled from 'styled-components'
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { ClearText } from '@opencrvs/components/src/icons'
import { Button } from '@opencrvs/components/src/Button'
import { Icon } from '@opencrvs/components/src/Icon'
import { ROUTES } from '@client/v2-events/routes'

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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.colors.white};
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0px 4px;
    width: 40%;
  }
`

const AdvancedSearchWrapper = styled.div`
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

interface INavigationType {
  label: string
  id: string
  onClick: () => void
}

const messagesToDefine = {
  header: {
    id: 'home.header.advancedSearch',
    defaultMessage: 'Advanced Search',
    description: 'Search menu advanced search type'
  },
  placeHolderText: {
    id: 'v2.home.header.searchTool.placeholder',
    defaultMessage:
      'Search for a tracking ID, name, registration number, national ID, phone number or email',
    description: 'Search tool placeholder'
  }
}
const messages = defineMessages(messagesToDefine)

export const SearchTool = () => {
  const intl = useIntl()
  const [searchParam, setSearchParam] = useState('')
  const navigate = useNavigate()
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParam(event.target.value)
  }
  const onClearTextHandler = () => {
    setSearchParam('')
  }

  const advancedSearchNavigationList: INavigationType = {
    label: intl.formatMessage(messages.header),
    id: 'advanced-search',
    onClick: () => {
      navigate(ROUTES.V2.ADVANCED_SEARCH.path)
    }
  }

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    return searchParam && alert(`Searching for: ${searchParam}`)
  }

  return (
    <SearchBox className={'search-tool'}>
      <Wrapper onSubmit={search}>
        <Button
          aria-label="Search"
          id="searchIconButton"
          size="medium"
          type="icon"
          onClick={search}
        >
          <Icon color="currentColor" name="MagnifyingGlass" size="large" />
        </Button>
        <SearchInput
          autoComplete="off"
          id="searchText"
          maxLength={200}
          placeholder={intl.formatMessage(messages.placeHolderText)}
          type={'text'}
          value={searchParam}
          onChange={onChangeHandler}
        />
        {searchParam && <ClearTextIcon onClick={onClearTextHandler} />}
        <AdvancedSearchWrapper
          id="searchType"
          onClick={() => {
            advancedSearchNavigationList.onClick()
            setSearchParam('')
          }}
        >
          <span className="selected-label">
            {advancedSearchNavigationList.label}
          </span>
        </AdvancedSearchWrapper>
      </Wrapper>
    </SearchBox>
  )
}
