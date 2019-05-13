import * as React from 'react'
import {
  SearchBlue,
  TrackingID,
  BRN,
  Phone,
  ArrowDownBlue,
  ClearText
} from '../../icons'
import styled from 'styled-components'

const Wrapper = styled.form`
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 2px;
  display: flex;
  font-family: ${({ theme }) => theme.fonts.lightFont};
  padding: 0 10px;
  position: relative;
`
const SearchTextInput = styled.input`
  border: none;
  margin: 0px 10px;
  font-size: 18px;
  flex-grow: 1;
  &:focus {
    outline: none;
  }
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px ${({ theme }) => theme.colors.white}
      inset;
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
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
`
const SelectedSearchCriteria = styled.span`
  background: ${({ theme }) => theme.colors.cardGradientEnd};
  border-radius: 2px;
  padding: 5px 10px;
  color: ${({ theme }) => theme.colors.white};
  font-weight: bold;
  margin-right: 10px;
`
const DropDown = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
`
const ClearTextIcon = styled(ClearText)`
  margin: 0 5px;
`
interface ISearchType {
  label: string
  value: string
  icon: React.ReactNode
  isDefault?: boolean
}
interface IState {
  dropDownIsVisible: boolean
  searchParam: string
  selectedSearchType: ISearchType
}
interface IProps {
  searchHandler: (param: string) => void
}
const SEARCH_TYPES = [
  {
    label: 'Tracking ID',
    value: 'trackingid',
    icon: <TrackingID />,
    isDefault: true
  },
  { label: 'BRN/DRN', value: 'brn-drn', icon: <BRN /> },
  { label: 'Phone no.', value: 'phone', icon: <Phone /> }
]

export class SearchTool extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      dropDownIsVisible: false,
      searchParam: '',
      selectedSearchType: this.getDefaultSearchType()
    }
  }
  getDefaultSearchType(): ISearchType {
    return (
      SEARCH_TYPES.find((item: ISearchType) => item.isDefault === true) ||
      SEARCH_TYPES[0]
    )
  }
  search = () => {
    return (
      this.state.searchParam && this.props.searchHandler(this.state.searchParam)
    )
  }
  dropdown() {
    return (
      this.state.dropDownIsVisible && (
        <DropDownWrapper>
          {SEARCH_TYPES.map(item => {
            return (
              <DropDownItem
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
    this.setState(_ => ({
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

    this.setState(prevState => ({
      dropDownIsVisible: !prevState.dropDownIsVisible
    }))
  }
  onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchParam: event.target.value, dropDownIsVisible: false })
  }
  render() {
    const selectedCriteria = `Enter ${this.state.selectedSearchType.label}`
    return (
      <Wrapper action="javascript:void(0);" onSubmit={this.search}>
        <SearchBlue onClick={this.search} />
        <SearchTextInput
          id="searchText"
          type="text"
          placeholder={selectedCriteria}
          onChange={this.onChangeHandler}
          value={this.state.searchParam}
        />
        {this.state.searchParam && (
          <ClearTextIcon onClick={() => this.setState({ searchParam: '' })} />
        )}
        <DropDown onClick={this.toggleDropdownDisplay}>
          <SelectedSearchCriteria>
            {this.state.selectedSearchType.label}
          </SelectedSearchCriteria>
          <ArrowDownBlue />
        </DropDown>
        {this.dropdown()}
      </Wrapper>
    )
  }
}
