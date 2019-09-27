import * as React from 'react'
import { SearchBlue } from '../icons'
import styled from 'styled-components'

const Wrapper = styled.div.attrs<{
  error?: boolean
  touched?: boolean
}>({})`
  align-items: center;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  padding-left: 5px;
  margin-bottom: 1px;
  position: relative;
  border-radius: 2px;
  width: 515px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
  ${({ error, touched, theme }) =>
    `
        border: 2px solid ${
          error && touched ? theme.colors.error : theme.colors.copy
        };
        `}
`
const SearchTextInput = styled.input`
  border: none;
  background: ${({ theme }) => theme.colors.background};
  margin: 2px 5px;
  ${({ theme }) => theme.fonts.bigBodyStyle};
  flex-grow: 1;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
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
