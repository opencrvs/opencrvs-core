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

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 1px;
  position: relative;
  & svg {
    position: absolute;
    left: 8px;
  }
`
const SearchTextInput = styled.input`
  width: 312px;
  height: 40px;
  border-radius: 2px;
  ${({ theme }) => theme.fonts.bigBodyStyle};
  padding-left: 36px;
  border: 2px solid ${({ theme }) => theme.colors.copy};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0px 3px ${({ theme }) => theme.colors.focus};
  }
`
const DropDownWrapper = styled.ul`
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0px 2px 8px rgba(53, 67, 93, 0.54);
  border-radius: 4px;
  position: absolute;
  min-width: 312px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
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
    background: ${({ theme }) => theme.colors.dropdownHover};
  }
`
const Label = styled.span`
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.copy};
`
export interface ILocationItem {
  id: string
  searchableText: string
  displayLabel: string
}
interface IState {
  dropDownIsVisible: boolean
  filteredList: ILocationItem[]
  selectedText: string | null
  selectedItem: ILocationItem | null
}
interface IProps {
  locationList: ILocationItem[]
  searchHandler?: (id: string) => void
}
export class LocationSearch extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      dropDownIsVisible: false,
      filteredList: [],
      selectedItem: null,
      selectedText: null
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
    const searchResult = [] as ILocationItem[]
    if (searchText.length > 0) {
      for (const location of this.props.locationList) {
        if (searchResult.length === 10) {
          break
        }
        if (
          location.searchableText
            .toLowerCase()
            .includes(searchText.toLowerCase())
        ) {
          searchResult.push(location)
        }
      }
    }
    this.setState({
      filteredList: searchResult,
      dropDownIsVisible: searchResult.length > 0
    })
  }

  onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    this.setState(_ => ({
      selectedText: text
    }))
    this.search(event.target.value)
  }

  onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select()
    if (this.state.selectedItem) {
      this.search(this.state.selectedItem.searchableText)
    }
  }

  dropDownItemSelect = (item: ILocationItem) => {
    if (this.props.searchHandler) {
      this.props.searchHandler(item.id)
    }

    this.setState(_ => ({
      dropDownIsVisible: false,
      selectedItem: item,
      selectedText: item.displayLabel
    }))
  }

  dropdown() {
    return (
      this.state.dropDownIsVisible && (
        <DropDownWrapper>
          {this.state.filteredList.map(item => {
            return (
              <DropDownItem
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

  render() {
    return (
      <Wrapper>
        <Location id="locationSearchIcon" />
        <SearchTextInput
          id="locationSearchInput"
          type="text"
          autoComplete="off"
          onFocus={this.onFocus}
          onClick={() => document.addEventListener('click', this.handler)}
          value={this.state.selectedText || ''}
          onChange={this.onChangeHandler}
        />
        {this.dropdown()}
      </Wrapper>
    )
  }
}
