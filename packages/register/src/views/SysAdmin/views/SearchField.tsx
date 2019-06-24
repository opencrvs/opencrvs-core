import * as React from 'react'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { IStoreState } from '@register/store'
import { getLanguage } from '@register/i18n/selectors'
import {
  ResponsiveModal,
  SearchInputWithIcon,
  RadioButton
} from '@opencrvs/components/lib/interface'
import styled, { withTheme } from 'styled-components'
import {
  PrimaryButton,
  TertiaryButton,
  LinkButton
} from '@opencrvs/components/lib/buttons'
import { ITheme } from '@opencrvs/components/lib/theme'
import { TextInput, InputLabel } from '@opencrvs/components/lib/forms'

const SelectButton = styled(PrimaryButton)`
  height: 40px;
  & div {
    padding: 0 8px;
  }
`
const CancelButton = styled(TertiaryButton)`
  height: 40px;
  & div {
    padding: 0;
  }
`
const ChildContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const ListContainer = styled.div`
  padding-top: 15px;

  & > div {
    padding-top: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.greySmoky};
  }
  & > div:first-child {
    border-top: 1px solid ${({ theme }) => theme.colors.greySmoky};
  }
`
const ItemContainer = styled.div.attrs<{ selected?: boolean }>({})`
  width: 870px;
  min-height: 96px;
  display: flex;
  justify-content: space-between;
  background: ${({ selected, theme }) =>
    selected
      ? theme.colors.chartAreaGradientEnd
      : theme.colors.white} !important;
`
interface IItemProps {
  width?: number
  isRight?: boolean
  color?: string
}

const Item = styled.div.attrs<IItemProps>({})`
  display: flex;
  width: ${({ width }) => (width ? width : 200)}px;
  padding: 5px 10px;
  justify-content: ${({ isRight }) => (isRight ? 'flex-end' : 'flex-start')};
  align-items: flex-start;
  ${({ color }) => color && `color: ${color};`}
`
const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  .item + .item {
    margin-top: 12px;
  }
`
const messages = defineMessages({
  title: {
    id: 'register.sysAdminHome.SearchField.title',
    defaultMessage: 'Assigned registration office',
    description: 'The title'
  },
  cancel: {
    id: 'register.sysAdminHome.SearchField.cancel',
    defaultMessage: 'Cancel',
    description: 'The cancel title'
  },
  select: {
    id: 'register.sysAdminHome.SearchField.select',
    defaultMessage: 'SELECT',
    description: 'The select title'
  },
  locationId: {
    id: 'register.sysAdminHome.SearchField.locationId',
    defaultMessage: 'Id: {locationId}',
    description: 'The location Id column'
  },
  editButton: {
    id: 'register.sysAdminHome.SearchField.editButton',
    defaultMessage: 'Change assigned office',
    description: 'Edit button text'
  },
  placeHolderText: {
    id: 'register.sysAdminHome.SearchField.placeHolderText',
    defaultMessage: 'Search',
    description: 'Place holder text '
  }
})
interface IProps {
  theme: ITheme
  language: string
  fieldValue: string
  fieldLabel: string
  onModalComplete: (value: string) => void
}
interface IState {
  searchText: string
  selectedValue: string
  showModal: boolean
  isSearchField: boolean
  fieldValue: string
}
interface ILocation {
  id: string
  name: string
  detailedLocation: string
}

type IFullProps = IProps & InjectedIntlProps
class SearchFieldClass extends React.Component<IFullProps, IState> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      searchText: '',
      selectedValue: '',
      showModal: false,
      isSearchField: this.props.fieldValue ? false : true,
      fieldValue: this.props.fieldValue || ''
    }
  }

  handleSearch = (param: string) => {
    this.setState({
      searchText: param
    })
  }

  handleChange = (value: string | number | boolean) => {
    this.setState({
      selectedValue: value as string
    })
  }

  toggleSearchModal = (param?: string) => {
    this.setState({
      searchText: param || '',
      showModal: !this.state.showModal,
      isSearchField: true
    })
  }

  onModalClose = () => {
    this.toggleSearchModal()
  }

  onModalComplete = (officeInput: ILocation) => {
    this.props.onModalComplete(officeInput.id)
    this.setState({
      searchText: '',
      showModal: !this.state.showModal,
      isSearchField: false,
      fieldValue: officeInput.name
    })
  }

  handleClick = () => {
    this.setState({
      isSearchField: true
    })
  }

  render() {
    const { intl } = this.props
    const placeHolderText = intl.formatMessage(messages.placeHolderText)
    const locationArray: ILocation[] = [
      {
        id: '309842043',
        name: 'Tunbridge Wells Office',
        detailedLocation: 'Lamberhurst, Tunbridge Wells TN3 8JN'
      },
      {
        id: '309842042',
        name: 'Tunbridge Wells Office2',
        detailedLocation: 'Lamberhurst, Tunbridge Wells TN3 8JN'
      },
      {
        id: '309842041',
        name: 'Tunbridge Wells Office3',
        detailedLocation: 'Lamberhurst, Tunbridge Wells TN3 8JN'
      }
    ]
    const selectedValue = this.state.selectedValue || locationArray[0].name
    let selectedLocation: ILocation = locationArray[0]
    const listItems = locationArray.map(
      (location: ILocation, index: number) => {
        if (location.name === selectedValue) {
          selectedLocation = location
        }
        return (
          <ItemContainer
            key={'item-container-' + index}
            selected={location.name === selectedValue}
          >
            <Item width={325}>
              <RadioButton
                id={'location-' + index}
                name="location"
                label={location.name}
                value={location.name}
                selected={selectedValue}
                onChange={this.handleChange}
              />
            </Item>
            <Item width={250}>{location.detailedLocation}</Item>
            <Item
              width={295}
              isRight={true}
              color={this.props.theme.colors.black}
            >
              {location.name === selectedValue &&
                intl.formatMessage(messages.locationId, {
                  locationId: location.id
                })}
            </Item>
          </ItemContainer>
        )
      }
    )

    return (
      <>
        {!this.state.showModal && (
          <InputLabel required={true}>{this.props.fieldLabel}</InputLabel>
        )}
        {!this.state.showModal && !this.state.isSearchField && (
          <InputSection>
            <TextInput
              value={this.state.fieldValue}
              disabled
              className="item"
            />
            <LinkButton
              id="edit-button"
              className="item"
              onClick={this.handleClick}
            >
              {intl.formatMessage(messages.editButton)}
            </LinkButton>
          </InputSection>
        )}
        {!this.state.showModal && this.state.isSearchField && (
          <SearchInputWithIcon
            placeHolderText={placeHolderText}
            searchText={this.state.searchText}
            searchHandler={this.toggleSearchModal}
          />
        )}
        {this.state.showModal && (
          <ResponsiveModal
            id="office-search-modal"
            title={intl.formatMessage(messages.title)}
            width={918}
            contentHeight={280}
            show={true}
            handleClose={this.onModalClose}
            actions={[
              <CancelButton
                key="cancel"
                id="modal_cancel"
                onClick={this.onModalClose}
              >
                {intl.formatMessage(messages.cancel)}
              </CancelButton>,
              <SelectButton
                key="select"
                id="modal_select"
                onClick={() => this.onModalComplete(selectedLocation)}
              >
                {intl.formatMessage(messages.select)}
              </SelectButton>
            ]}
          >
            <ChildContainer>
              <SearchInputWithIcon
                placeHolderText={placeHolderText}
                searchText={this.state.searchText}
                searchHandler={this.handleSearch}
              />
              <ListContainer>{listItems}</ListContainer>
            </ChildContainer>
          </ResponsiveModal>
        )}
      </>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store)
  }
}

export const SearchField = connect(mapStateToProps)(
  withTheme(injectIntl(SearchFieldClass))
)
