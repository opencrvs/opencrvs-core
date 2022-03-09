/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import styled from 'styled-components'
import { Location } from '../../icons'
import { PrimaryButton } from '../../buttons'
import { InputError } from '../../forms/InputField/InputError'

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
  border-radius: 2px;
  ${({ theme }) => theme.fonts.reg18};
  padding-left: 36px;
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
interface IState {
  dropDownIsVisible: boolean
  filteredList: ISearchLocation[]
  selectedText: string | null
  selectedItem: ISearchLocation | null
  isFocused?: boolean
}
interface IProps {
  locationList: ISearchLocation[]
  selectedLocation?: ISearchLocation | undefined
  searchHandler?: (location: ISearchLocation) => void
  searchButtonHandler?: () => void
  id?: string
  onBlur?: (e: React.FocusEvent<any>) => void
  errorMessage?: string
  error?: boolean
  touched?: boolean
  className?: string
}
export class LocationSearch extends React.Component<IProps, IState> {
  searchTimeout: NodeJS.Timeout | undefined
  constructor(props: IProps) {
    super(props)
    this.state = {
      dropDownIsVisible: false,
      filteredList: [],
      selectedItem: null,
      selectedText: null,
      isFocused: false
    }
  }
  handler = () => {
    document.removeEventListener('click', this.handler)
    this.setState({
      dropDownIsVisible: false
    })
  }

  searchOnEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  search = (searchText: string) => {
    const searchResult = [] as ISearchLocation[]
    if (searchText.length > 0) {
      for (const location of this.props.locationList) {
        if (searchResult.length === 10) {
          break
        }
        if (
          location.searchableText
            .toLowerCase()
            .startsWith(searchText.toLowerCase())
        ) {
          searchResult.push(location)
        }
      }
    }
    if (
      searchResult.length === 0 ||
      (this.state.selectedItem &&
        this.state.selectedText !== this.state.selectedItem.displayLabel)
    ) {
      this.setState({
        selectedItem: null
      })
    }

    this.setState({
      filteredList: searchResult,
      dropDownIsVisible: searchResult.length > 0
    })
  }

  debounce(callback: () => void, duration: number) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
    this.searchTimeout = setTimeout(callback, duration)
  }

  onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    this.setState((_) => ({
      selectedText: text
    }))
    this.debounce(() => this.search(text), SEARCH_DEBOUNCE_DURATION)
  }

  onBlurHandler = (event: React.FocusEvent<HTMLInputElement>) => {
    this.setState({
      isFocused: false
    })
    if (this.props.onBlur && this.props.searchHandler) {
      this.props.searchHandler({
        id: this.state.selectedText ? '0' : '',
        searchableText: this.state.selectedText || '',
        displayLabel: this.state.selectedText || ''
      })
      this.props.onBlur(event)
    }
  }

  onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    this.setState({
      isFocused: true
    })
    setTimeout(event.target.select.bind(event.target), 20)
    if (
      this.state.selectedItem &&
      this.state.selectedText === this.state.selectedItem.displayLabel
    ) {
      this.search(this.state.selectedItem.searchableText)
    } else {
      this.search(this.state.selectedText || '')
    }
  }

  dropDownItemSelect = (item: ISearchLocation) => {
    if (this.props.searchHandler) {
      this.props.searchHandler(item)
    }

    this.setState((_) => ({
      dropDownIsVisible: false,
      selectedItem: item,
      selectedText: item.displayLabel
    }))
  }

  dropdown() {
    return (
      this.state.dropDownIsVisible && (
        <DropDownWrapper>
          {this.state.filteredList.map((item) => {
            return (
              <DropDownItem
                id={`locationOption${item.id}`}
                key={item.id}
                onClick={() => this.dropDownItemSelect(item)}
              >
                <Label>{item.displayLabel}</Label>
              </DropDownItem>
            )
          })}
        </DropDownWrapper>
      )
    )
  }

  componentDidMount() {
    if (this.props.selectedLocation) {
      this.setState({
        selectedText: this.props.selectedLocation.displayLabel,
        selectedItem: this.props.selectedLocation
      })
    }
  }

  componentWillUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
    document.removeEventListener('click', this.handler)
  }

  render() {
    return (
      <>
        <LocationSearchContainer>
          <Wrapper className={this.props.className}>
            <Location id="locationSearchIcon" />
            <SearchTextInput
              id={this.props.id ? this.props.id : 'locationSearchInput'}
              type="text"
              autoComplete="off"
              onFocus={this.onFocus}
              onBlur={this.onBlurHandler}
              onClick={() => document.addEventListener('click', this.handler)}
              value={this.state.selectedText || ''}
              onChange={this.onChangeHandler}
              error={this.props.error}
              touched={this.props.touched}
            />
            {this.dropdown()}
          </Wrapper>
          {this.props.searchButtonHandler && (
            <SearchButton
              id="location-search-btn"
              onClick={this.props.searchButtonHandler}
              disabled={!(this.state.selectedItem && this.state.selectedText)}
            >
              Search
            </SearchButton>
          )}
        </LocationSearchContainer>
        {!this.state.selectedItem &&
          this.state.selectedText &&
          this.props.errorMessage &&
          !this.state.isFocused && (
            <InputError id="location-search-error">
              {this.props.errorMessage}
            </InputError>
          )}
      </>
    )
  }
}
