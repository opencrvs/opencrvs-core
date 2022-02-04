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
import { SearchBlue, ArrowDownBlue, ClearText } from '../../icons'
import { CircleButton } from '../../buttons'
import styled from 'styled-components'

const Wrapper = styled.form`
  align-items: center;
  border-radius: 2px;
  display: flex;
  ${({ theme }) => theme.fonts.bodyStyle};
  padding: 0px 10px;
  padding-right: 0;
  margin-bottom: 1px;
  position: relative;
`
const SearchTextInput = styled.input`
  border: none;
  margin: 0px 10px;
  ${({ theme }) => theme.fonts.bodyStyle};
  flex-grow: 1;
  &:focus {
    outline: none;
  }
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px ${({ theme }) => theme.colors.white}
      inset;
  }
  background-color: ${({ theme }) => theme.colors.grey300};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0px 4px;
    width: 40%;
  }
`
const DropDownWrapper = styled.ul`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 2px;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
  position: absolute;
  width: 100%;
  z-index: 9999;
  list-style: none;
  padding: 0px;
  top: 100%;
  left: 0px;
  margin: 3px 0px;
  cursor: pointer;
`

export const IconRingButton = styled((props) => <CircleButton {...props} />)`
  background: transparent;
  border: none;
  height: 24px;
  width: 24px;
  margin: 0 5px;
  padding: 0;
  & > svg {
    display: block;
    margin: 0 auto;
  }
  &:focus {
    outline: none;
    border: 3px solid ${({ theme }) => theme.colors.focus};
    background: transparent;
  }
  &:not([data-focus-visible-added]) {
    background: transparent;
    outline: none;
    border: none;
  }
  &:active:not([data-focus-visible-added]) {
    border: 3px solid ${({ theme }) => theme.colors.focus};
    background: transparent;
    outline: none;
  }
`
const DropDownItem = styled.li`
  display: flex;
  align-items: center;
  border-bottom: solid 1px ${({ theme }) => theme.colors.background};
  padding: 0px 15px;
  cursor: pointer;
  &:nth-last-child {
    border-bottom: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.dropdownHover};
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
  background: ${({ theme }) => theme.colors.secondary};
  border-radius: 2px;
  padding: 5px 10px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.captionStyle};
  display: flex;
  & .selected-icon {
    display: none;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding: 2px;
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
          <IconRingButton>
            <ArrowDownBlue />
          </IconRingButton>
        </DropDown>
        {this.dropdown()}
      </Wrapper>
    )
  }
}
