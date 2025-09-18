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
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { useLocation, useNavigate } from 'react-router-dom'
import { ClearText } from '@opencrvs/components/src/icons'
import { Button } from '@opencrvs/components/src/Button'
import { Icon } from '@opencrvs/components/src/Icon'
import { ROUTES } from '@client/v2-events/routes'
import { serializeSearchParams } from '@client/v2-events/features/events/Search/utils'

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

const messages = {
  header: {
    id: 'home.header.advancedSearch',
    defaultMessage: 'Advanced Search',
    description: 'Search menu advanced search type'
  },
  placeHolderText: {
    id: 'home.header.searchTool.placeholder',
    defaultMessage: 'Search by name, ID, or by using contact details.',
    description: 'Search tool placeholder'
  }
}

export const SearchToolbar = () => {
  const intl = useIntl()
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined)
  const navigate = useNavigate()
  const location = useLocation()

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const clearSearchTerm = () => {
    setSearchTerm(undefined)
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const searchUrl = ROUTES.V2.SEARCH.buildPath({})

    if (!searchTerm) {
      return
    }

    const serializedParams = serializeSearchParams({ keys: searchTerm })

    navigate(`${searchUrl}?${serializedParams}`)
  }

  useEffect(() => {
    // Clear the search term when navigating away from the search results page
    if (location.pathname !== ROUTES.V2.SEARCH.buildPath({})) {
      setSearchTerm(undefined)
    }
  }, [location.pathname])

  return (
    <SearchBox className={'search-tool'}>
      <Wrapper onSubmit={onSearch}>
        <Button
          aria-label="Search"
          id="searchIconButton"
          size="medium"
          type="icon"
          onClick={onSearch}
        >
          <Icon color="currentColor" name="MagnifyingGlass" size="large" />
        </Button>
        <SearchInput
          autoComplete="off"
          id="searchText"
          maxLength={200}
          placeholder={intl.formatMessage(messages.placeHolderText)}
          type={'text'}
          value={searchTerm ?? ''}
          onChange={onChangeHandler}
        />
        {searchTerm && <ClearTextIcon onClick={clearSearchTerm} />}
        <AdvancedSearchWrapper
          id="searchType"
          onClick={() => {
            clearSearchTerm()
            navigate(ROUTES.V2.ADVANCED_SEARCH.path)
          }}
        >
          <span className="selected-label">
            {intl.formatMessage(messages.header)}
          </span>
        </AdvancedSearchWrapper>
      </Wrapper>
    </SearchBox>
  )
}
