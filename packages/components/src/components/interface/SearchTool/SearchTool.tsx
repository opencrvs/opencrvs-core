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
import { SearchBlue, ClearText } from '../../icons'
import { Button, CircleButton } from '../../buttons'
import styled from 'styled-components'

const Wrapper = styled.form`
  align-items: center;
  border-radius: 2px;
  display: flex;
  ${({ theme }) => theme.fonts.bodyStyle};
  padding: 0px 4px;
  margin-bottom: 1px;
  position: relative;
`
// Remove Autofill for search
const SearchTextInput = styled.input`
  border: none;
  margin: 0px 0px;
  ${({ theme }) => theme.fonts.bodyStyle};
  background-color: ${({ theme }) => theme.colors.grey300};
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
  ${({ theme }) => theme.fonts.subtitleStyle};
`

const DropDownWrapper = styled.ul`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  ${({ theme }) => theme.shadows.heavyShadow};
  position: absolute;
  padding: 8px 0px;
  width: 250px;
  z-index: 9999;
  list-style: none;
  top: 100%;
  right: -56px;
  margin: 6px 0px;
  cursor: pointer;
`
const DropDownItem = styled.li`
  display: flex;
  align-items: center;
  cursor: pointer;
  &:nth-last-child {
    border-bottom: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
  &:hover span {
    color: ${({ theme }) => theme.colors.white};
  }
  &:hover svg path {
    stroke: ${({ theme }) => theme.colors.white};
  }
`
const IconWrapper = styled.span`
  display: flex;
  padding: 8px 16px;
`
const Label = styled.span`
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.copy};
`
const SelectedSearchCriteria = styled.span`
  background: ${({ theme }) => theme.colors.gray300};
  border-radius: 2px;
  padding: 5px 10px;
  color: ${({ theme }) => theme.colors.primary};
  ${({ theme }) => theme.fonts.subtitleStyle};
  display: flex;
  & .selected-icon {
    display: none;
  }
  & .selected-label {
    border-radius: 50px;
    text-align: center;
    margin-right: 8px;
    width: auto;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding: 2px;
    padding-right: 7px;
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
  margin: 0 5px;
`
export interface ISearchType {
  label: string
  value: string
  icon: React.ReactNode
  invertIcon: React.ReactNode
  isDefault?: boolean
  placeHolderText: string
}
interface IState {
  dropDownIsVisible: boolean
  searchParam: string
  language: string
  selectedSearchType: ISearchType
}
interface IProps {
  searchTypeList: ISearchType[]
  searchText?: string
  selectedSearchType?: string
  language: string
  searchHandler: (searchText: string, searchType: string) => void
  onClearText?: () => void
}
export class SearchTool extends React.Component<IProps, IState> {
  static getDerivedStateFromProps(nextProps: IProps, previousState: IState) {
    if (nextProps.language !== previousState.language) {
      return {
        selectedSearchType: nextProps.searchTypeList.find(
          (item: ISearchType) =>
            item.value === previousState.selectedSearchType.value
        ),
        language: nextProps.language
      }
    }
    return null
  }

  constructor(props: IProps) {
    super(props)

    this.state = {
      dropDownIsVisible: false,
      searchParam: this.props.searchText ? this.props.searchText : '',
      language: this.props.language,
      selectedSearchType: this.getDefaultSearchType()
    }
  }

  getDefaultSearchType(): ISearchType {
    if (this.props.selectedSearchType) {
      return (
        this.props.searchTypeList.find(
          (item: ISearchType) => item.value === this.props.selectedSearchType
        ) || this.props.searchTypeList[0]
      )
    }
    return (
      this.props.searchTypeList.find(
        (item: ISearchType) => item.isDefault === true
      ) || this.props.searchTypeList[0]
    )
  }
  search = (e: React.FormEvent) => {
    e.preventDefault()
    return (
      this.state.searchParam &&
      this.props.searchHandler(
        this.state.searchParam,
        this.state.selectedSearchType.value
      )
    )
  }
  dropdown() {
    return (
      this.state.dropDownIsVisible && (
        <DropDownWrapper>
          {this.props.searchTypeList.map((item) => {
            return (
              <DropDownItem
                id={item.value}
                key={item.value}
                onClick={() => this.dropDownItemSelect(item)}
              >
                <IconWrapper>{item.icon}</IconWrapper>
                <Label>{item.label}</Label>
              </DropDownItem>
            )
          })}
        </DropDownWrapper>
      )
    )
  }
  dropDownItemSelect = (item: ISearchType) => {
    this.setState((_) => ({
      selectedSearchType: item,
      dropDownIsVisible: false
    }))
  }
  toggleDropdownDisplay = () => {
    const handler = () => {
      this.setState({ dropDownIsVisible: false })
      document.removeEventListener('click', handler)
    }
    if (!this.state.dropDownIsVisible) {
      document.addEventListener('click', handler)
    }

    this.setState((prevState) => ({
      dropDownIsVisible: !prevState.dropDownIsVisible
    }))
  }
  onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchParam: event.target.value, dropDownIsVisible: false })
  }

  onClearTextHandler = () => {
    const { onClearText } = this.props
    this.setState({ searchParam: '' })

    if (onClearText) {
      onClearText()
    }
  }

  render() {
    const { placeHolderText } = this.state.selectedSearchType
    return (
      <Wrapper onSubmit={this.search}>
        <SearchBlue id="searchIconButton" onClick={this.search} />
        <SearchTextInput
          id="searchText"
          type="text"
          placeholder={placeHolderText}
          onChange={this.onChangeHandler}
          value={this.state.searchParam}
        />
        {this.state.searchParam && (
          <ClearTextIcon onClick={this.onClearTextHandler} />
        )}
        <DropDown id="searchType" onClick={this.toggleDropdownDisplay}>
          <SelectedSearchCriteria>
            <span className="selected-icon">
              {this.state.selectedSearchType.invertIcon}
            </span>
            <span className="selected-label">
              {this.state.selectedSearchType.label}
            </span>
          </SelectedSearchCriteria>
        </DropDown>
        {this.dropdown()}
      </Wrapper>
    )
  }
}
