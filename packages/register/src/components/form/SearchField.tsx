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
  width: ${({ width }) => (width ? width : 280)}px;
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
  modalTitle: {
    id: 'formFields.SearchField.modalTitle',
    defaultMessage: `{fieldName, select, registrationOffice {Assigned Register Office}}`,
    description: 'Modal title'
  },
  modalCancel: {
    id: 'formFields.SearchField.modalCancel',
    defaultMessage: 'Cancel',
    description: 'The cancel title'
  },
  modalSelect: {
    id: 'formFields.SearchField.modalSelect',
    defaultMessage: 'SELECT',
    description: 'The select title'
  },
  locationId: {
    id: 'formFields.SearchField.locationId',
    defaultMessage: 'Id: {locationId}',
    description: 'The location Id column'
  },
  editButton: {
    id: 'formFields.SearchField.editButton',
    defaultMessage: 'Change assigned office',
    description: 'Edit button text'
  },
  placeHolderText: {
    id: 'formFields.SearchField.placeHolderText',
    defaultMessage: 'Search',
    description: 'Place holder text '
  }
})

interface IProps {
  theme: ITheme
  language: string
  fieldName: string
  fieldValue: { [key: string]: string }
  fieldLabel: string
  isFieldRequired: boolean
  onModalComplete: (label: string, value: string) => void
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
      fieldValue: this.props.fieldValue.label || ''
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
      isSearchField: !this.state.isSearchField
    })
  }

  onModalClose = () => {
    this.toggleSearchModal()
  }

  onModalComplete = (value: ILocation) => {
    this.props.onModalComplete(value.name, value.id)
    this.setState({
      searchText: '',
      showModal: !this.state.showModal,
      isSearchField: false,
      fieldValue: value.name
    })
  }

  handleClick = () => {
    this.setState({
      isSearchField: true,
      searchText: this.state.fieldValue,
      showModal: true
    })
  }

  render() {
    const { intl, fieldLabel, fieldName, isFieldRequired } = this.props
    const placeHolderText = intl.formatMessage(messages.placeHolderText)
    const locations: ILocation[] = [
      {
        id: '79776844-b606-40e9-8358-7d82147f702a',
        name: 'Moktarpur Union Parishad',
        detailedLocation: 'Moktarpur, Kaliganj, Gazipur, Dhaka'
      },
      {
        id: 'd8f5e899-0461-4d58-943f-3a980733a8d3',
        name: 'Amdia Union Parishad',
        detailedLocation: 'Amdia, Narsingdi Sadar, Narsingdi, Dhaka'
      },
      {
        id: '3e7a3524-e0d2-4a5b-959a-845efbe1fca8',
        name: 'Bhurungamari Union Parishad',
        detailedLocation: 'Bhurungamari, Bhurungamari, Kurigram, Rangpur'
      }
    ]
    const selectedValue = this.state.selectedValue || locations[0].name
    let selectedLocation: ILocation = locations[0]
    const listItems = locations.map((location: ILocation, index: number) => {
      if (location.name === selectedValue) {
        selectedLocation = location
      }
      return (
        <ItemContainer
          key={'item-container-' + index}
          selected={location.name === selectedValue}
        >
          <Item>
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
          <Item isRight={true} color={this.props.theme.colors.black}>
            {location.name === selectedValue &&
              intl.formatMessage(messages.locationId, {
                locationId: location.id
              })}
          </Item>
        </ItemContainer>
      )
    })

    return (
      <>
        {!this.state.showModal && (
          <InputLabel required={isFieldRequired}>{fieldLabel}</InputLabel>
        )}
        {!this.state.showModal && !this.state.isSearchField && (
          <InputSection>
            <TextInput
              id={this.props.fieldName + '-id'}
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

        <ResponsiveModal
          id="office-search-modal"
          title={intl.formatMessage(messages.modalTitle, {
            fieldName: fieldName
          })}
          width={918}
          contentHeight={280}
          show={this.state.showModal}
          handleClose={this.onModalClose}
          actions={[
            <CancelButton
              key="modal_cancel"
              id="modal_cancel"
              onClick={this.onModalClose}
            >
              {intl.formatMessage(messages.modalCancel)}
            </CancelButton>,
            <SelectButton
              key="modal_select"
              id="modal_select"
              onClick={() => this.onModalComplete(selectedLocation)}
            >
              {intl.formatMessage(messages.modalSelect)}
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
