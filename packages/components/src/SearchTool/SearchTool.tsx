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
import * as React from 'react'
import { ClearText } from '../icons'
import { Button } from '../Button'
import { Icon } from '../Icon'
import styled from 'styled-components'
import { Text } from '../Text'

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
  margin: 0 12px;
`
export interface ISearchType {
  label: string
  value: string
  icon: React.ReactNode
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
                id={item.value}
                key={item.value}
                onClick={() => this.dropDownItemSelect(item)}
              >
                {item.icon}
                {item.label}
              </DropDownItem>
            )
          })}
          {this.props.navigationList?.map((item) => {
            return (
              <AdvancedSearchWrapper>
                <Button
                  id={item.id}
                  key={item.id}
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
      //https://github.com/facebook/react/issues/24657#issuecomment-1150119055
      setTimeout(() => document.addEventListener('click', handler), 0)
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
    const { placeHolderText, value } = this.state.selectedSearchType
    return (
      <SearchBox className={this.props.className}>
        <Wrapper onSubmit={this.search}>
          <Button
            type="icon"
            size="medium"
            aria-label="Search"
            id="searchIconButton"
            onClick={this.search}
          >
            <Icon color="currentColor" name="MagnifyingGlass" size="large" />
          </Button>
          <SearchInput
            id="searchText"
            type={value === 'phone' ? 'tel' : 'text'}
            autoComplete="off"
            placeholder={placeHolderText}
            onChange={this.onChangeHandler}
            value={this.state.searchParam}
            maxLength={200}
          />
          {this.state.searchParam && (
            <ClearTextIcon onClick={this.onClearTextHandler} />
          )}
          <DropDown id="searchType" onClick={this.toggleDropdownDisplay}>
            <SelectedSearchCriteria>
              <span className="selected-icon">
                {this.state.selectedSearchType.icon}
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
