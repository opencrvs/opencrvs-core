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
import styled, { StyledFunction } from 'styled-components'
import { Search } from '../icons'
import { PrimaryButton } from '../buttons'

export interface ISerachInputCustomProps {
  searchValue?: string
  error?: boolean
  touched?: boolean
  focusInput?: boolean
  buttonLabel: string
  onSearchTextChange?: (searchText: string) => void
  onSubmit: (searchText: string) => any
}

export type ISearchInputProps = ISerachInputCustomProps &
  React.InputHTMLAttributes<HTMLInputElement>

const SearchContainer = styled.div`
  width: 100%;
  padding: 10px ${({ theme }) => theme.grid.margin}px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-wrap: wrap;
  }
`
const SearchIconAndInput = styled.div`
  display: flex;
  flex: 1 1 auto;
  width: 100%;
`

const SearchIcon = styled(Search)`
  margin-bottom: 5px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.sm}px) {
    display: none;
  }
`
const StyledSearchButton = styled(PrimaryButton)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-top: 20px;
    margin-bottom: 11px;
    max-width: 200px;
    flex: 1;
  }
  &:disabled {
    div:first-of-type {
      background: ${({ theme }) => theme.colors.disabled};
    }
    g {
      fill: ${({ theme }) => theme.colors.disabled};
    }
    h3 {
      color: ${({ theme }) => theme.colors.disabled};
    }
  }
`
const StyledInput = styled.input<ISearchInputProps>`
  flex: 1;
  padding: 5px 15px 5px 5px;
  margin: 0 20px 0 10px;
  min-height: 30px;
  min-width: 0px;
  transition: border-color 500ms ease-out;
  border: 0px solid;
  border-bottom: solid 1px ${({ theme }) => theme.colors.secondary};
  ${({ error, touched, theme }) =>
    error && touched ? theme.colors.negative : theme.colors.disabled};
  box-sizing: border-box;
  outline: none;
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.secondary};

  &:focus {
    border-bottom: solid 1px ${({ theme }) => theme.colors.secondary};
  }

  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholderCopy};
  }

  &::-moz-placeholder {
    color: ${({ theme }) => theme.colors.placeholderCopy};
  }

  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholderCopy};
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  &[maxlength='1'] {
    -moz-appearance: textfield;
    display: block;
    float: left;
    padding: 0;
    text-align: center;
  }
`
interface IState {
  searchText: string
}

export class SearchInput extends React.Component<ISearchInputProps, IState> {
  private $element: React.RefObject<HTMLInputElement>
  constructor(props: ISearchInputProps, {}) {
    super(props)
    this.state = {
      searchText: ''
    }
    this.$element = React.createRef()
  }
  focusField(): void {
    /*
     * Needs to be run on the next tick
     * so that 'value' prop has enough time to flow back here
     * if the focusInput prop is called right after keydown
     */
    setTimeout(() => {
      this.$element.current!.focus()
    })
  }
  componentDidUpdate(prevProps: ISearchInputProps) {
    if (!prevProps.focusInput && this.props.focusInput) {
      this.focusField()
    }
  }
  componentDidMount() {
    this.setState({ searchText: this.props.searchValue || '' })
  }

  change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState({ searchText: value })
    if (this.props.onSearchTextChange) {
      this.props.onSearchTextChange(value)
    }
  }

  submit = () => {
    this.props.onSubmit(this.state.searchText)
  }

  render() {
    const { focusInput, placeholder, buttonLabel, ...props } = this.props
    const value = this.state.searchText
    return (
      <SearchContainer>
        <SearchIconAndInput>
          <SearchIcon />
          <StyledInput
            onChange={this.change}
            value={value}
            ref={this.$element}
            {...this.props}
          />
        </SearchIconAndInput>
        <StyledSearchButton
          onClick={this.submit}
          disabled={!value ? true : false}
        >
          {' '}
          {buttonLabel}
        </StyledSearchButton>
      </SearchContainer>
    )
  }
}
