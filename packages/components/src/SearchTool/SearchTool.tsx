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
import { SearchBlue, ClearText } from '../icons'
import { Button } from '../buttons'
import styled from 'styled-components'
import { Text } from '../Text'

const SearchBox = styled.div`
  background: ${({ theme }) => theme.colors.grey200};
  box-sizing: border-box;
  border-radius: 40px;
  width: 664px;
  height: 40px;

  &:hover {
    outline: 1px solid ${({ theme }) => theme.colors.grey600};
  }

  &:focus-within {
    outline: 1px solid ${({ theme }) => theme.colors.grey600};
    background: ${({ theme }) => theme.colors.white};
  }

  &:active {
    outline: 1px solid ${({ theme }) => theme.colors.grey600};
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
  ${({ theme }) => theme.fonts.reg16};
  padding: 0px 10px;
  padding-right: 0;
  margin-bottom: 1px;
  position: relative;
`
const SearchTextInput = styled.input`
  border: none;
  margin: 0px 4px;
  ${({ theme }) => theme.fonts.reg16};
  background-color: ${({ theme }) => theme.colors.grey200};
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
  padding: 8px 0px;
  width: 240px;
  z-index: 9999;
  list-style: none;
  top: 100%;
  right: 0px;
  margin: 4px 0px;
  cursor: pointer;
`

const DropDownItem = styled.li<{ borderTop: boolean }>`
  ${({ theme }) => theme.fonts.reg16};
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 8px 8px 16px;
  ${({ borderTop, theme }) =>
    borderTop
      ? `border-top: 1px solid ${theme.colors.grey200}; padding:2px 2px 2px 10px; margin-top: 2px`
      : ''}
  &:nth-last-child {
    border-bottom: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
  }
  &:hover span {
    color: ${({ theme }) => theme.colors.copy};
  }
`
const IconWrapper = styled.span`
  display: flex;
  padding-right: 12px;
  padding-left: 0;
`
const Label = styled.span`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};
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
export interface INavigationType {
  label: string
  id: string
  icon?: React.ReactNode
  onClick: () => void
}
interface IState {
  dropDownIsVisible: boolean
  searchParam: string
  language: string
  selectedSearchType: ISearchType
}
interface IProps {
  searchTypeList: ISearchType[]
  navigationList?: INavigationType[]
  searchText?: string
  selectedSearchType?: string
  language: string
  searchHandler: (searchText: string, searchType: string) => void
  onClearText?: () => void
  className?: string
}
export class SearchTool extends React.Component<IProps, IState> {
  static getDerivedStateFromProps: React.GetDerivedStateFromProps<
    IProps,
    IState
  > = (nextProps, previousState) => {
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
                borderTop={false}
                id={item.value}
                key={item.value}
                onClick={() => this.dropDownItemSelect(item)}
              >
                <IconWrapper>{item.icon}</IconWrapper>
                <Label>{item.label}</Label>
              </DropDownItem>
            )
          })}
          {this.props.navigationList?.map((item) => {
            return (
              <DropDownItem
                borderTop={true}
                id={item.id}
                key={item.id}
                onClick={() => item.onClick()}
              >
                <IconWrapper>{item.icon}</IconWrapper>
                <Text variant={'bold14'} element={'p'} color={'primary'}>
                  {item.label}
                </Text>
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
      <SearchBox className={this.props.className}>
        <Wrapper onSubmit={this.search}>
          <SearchBlue id="searchIconButton" onClick={this.search} />
          <SearchTextInput
            id="searchText"
            type="text"
            autoComplete="off"
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
      </SearchBox>
    )
  }
}
