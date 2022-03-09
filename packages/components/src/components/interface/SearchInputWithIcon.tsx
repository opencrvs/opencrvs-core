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
import { SearchBlue } from '../icons'
import styled from 'styled-components'

const Wrapper = styled.div<{
  error?: boolean
  touched?: boolean
}>`
  align-items: center;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  padding-left: 5px;
  margin-bottom: 1px;
  position: relative;
  border-radius: 2px;
  width: 515px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
  }
  ${({ error, touched, theme }) =>
    `
        border: 2px solid ${
          error && touched ? theme.colors.negative : theme.colors.copy
        };
        `}
`
const SearchTextInput = styled.input`
  border: none;
  background: ${({ theme }) => theme.colors.background};
  margin: 2px 5px;
  ${({ theme }) => theme.fonts.reg18};
  flex-grow: 1;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
  }
  &:focus {
    outline: none;
  }
`
interface IState {
  searchParam: string
}
interface IProps {
  searchText?: string
  placeHolderText: string
  error?: boolean
  touched?: boolean
  searchHandler: (searchText: string) => void
}
export class SearchInputWithIcon extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      searchParam: this.props.searchText ? this.props.searchText : ''
    }
  }

  search = () => {
    return this.props.searchHandler(this.state.searchParam)
  }
  searchOnEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      return this.props.searchHandler(this.state.searchParam)
    }
  }

  onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchParam: event.target.value })
  }

  render() {
    return (
      <Wrapper error={this.props.error} touched={this.props.touched}>
        <SearchBlue id="searchInputIcon" onClick={this.search} />
        <SearchTextInput
          id="searchInputText"
          type="text"
          placeholder={this.props.placeHolderText}
          onChange={this.onChangeHandler}
          onKeyPress={this.searchOnEnterPress}
          value={this.state.searchParam}
        />
      </Wrapper>
    )
  }
}
