import * as React from 'react'
import { SearchBlue } from '../icons'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  padding-left: 5px;
  margin-bottom: 1px;
  position: relative;
  border: 2px solid ${({ theme }) => theme.colors.copy};
  border-radius: 2px;
  width: 515px;
`
const SearchTextInput = styled.input`
  border: none;
  background: ${({ theme }) => theme.colors.background};
  margin: 2px 5px;
  ${({ theme }) => theme.fonts.bigBodyStyle};
  flex-grow: 1;
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
    return (
      this.state.searchParam && this.props.searchHandler(this.state.searchParam)
    )
  }
  searchOnEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      return (
        this.state.searchParam &&
        this.props.searchHandler(this.state.searchParam)
      )
    }
  }

  onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchParam: event.target.value })
  }

  render() {
    return (
      <Wrapper>
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
