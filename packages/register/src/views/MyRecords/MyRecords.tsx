import * as React from 'react'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { IFormSection, IFormSectionData } from 'forms'
import {
  ActionPage,
  ListItem,
  ListItemExpansion,
  DataTable
} from '@opencrvs/components/lib/interface'
// import { Spinner } from '@opencrvs/components/lib/interface'
import styled from 'styledComponents'
// import { Query } from 'react-apollo'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import {
  StatusGray,
  StatusOrange,
  StatusGreen,
  StatusCollected
} from '@opencrvs/components/lib/icons'
import { goToHome as goToHomeAction } from 'navigation'
import { IStoreState } from 'store'
import { HeaderContent } from '@opencrvs/components/lib/layout'

const Container = styled.div`
  margin: 0 ${({ theme }) => theme.grid.margin}px;
`
// const StyledSpinner = styled(Spinner)`
//   margin: 50% auto;
// `
const StyledPrimaryButton = styled(PrimaryButton)`
  font-family: ${({ theme }) => theme.fonts.boldFont};
`
// const ErrorText = styled.div`
//   color: ${({ theme }) => theme.colors.error};
//   font-family: ${({ theme }) => theme.fonts.lightFont};
//   text-align: center;
//   margin-top: 100px;
// `
const StatusIcon = styled.div`
  margin-top: 3px;
`

const StatusIconCollected = styled.div`
  padding-left: 6px;
  margin-top: 3px;
`

const data = [
  {
    id: 123,
    name: 'John Doe',
    dob: '2010-01-01',
    date_of_application: '2001-10-10',
    tracking_id: '23221',
    event: 'BIRTH',
    declaration_status: 'REGISTERED'
  },
  {
    id: 234,
    name: 'Jane Doe',
    dob: '2010-01-02',
    date_of_application: '2001-10-20',
    tracking_id: '33333',
    event: 'BIRTH',
    declaration_status: 'CERTIFIED'
  }
]
type State = {
  data: IFormSectionData
  enableConfirmButton: boolean
}

type IProps = {
  backLabel: string
  registrationId: string
  goToHome: typeof goToHomeAction
  printCertificateFormSection: IFormSection
}

type IFullProps = InjectedIntlProps & IProps

const messages = defineMessages({
  title: {
    id: 'myRecords.title',
    defaultMessage: 'My Records',
    description: 'The displayed title in the header'
  },
  dataTableResults: {
    id: 'myRecords.dataTable.results',
    defaultMessage: 'Results',
    description: 'Results label at the top of the data table component'
  },
  dataTableNoResults: {
    id: 'myRecords.dataTable.noResults',
    defaultMessage: 'No result to display',
    description:
      'Text to display if the search return no results for the current filters'
  },
  filtersAllEvents: {
    id: 'myRecords.labels.events.all',
    defaultMessage: 'All life events',
    description: 'Label for the filter by all events option'
  },
  filtersFilterBy: {
    id: 'myRecords.labels.selects.filter',
    defaultMessage: 'Filter by',
    description: 'Label for the filter by section of the filters'
  },
  filtersBirth: {
    id: 'myRecords.labels.events.birth',
    defaultMessage: 'Birth',
    description: 'Label for the filter by birth option'
  },
  filtersDeath: {
    id: 'myRecords.labels.events.death',
    defaultMessage: 'Death',
    description: 'Label for the filter by death option'
  },
  filtersMarriage: {
    id: 'myRecords.labels.events.marriage',
    defaultMessage: 'Marriage',
    description: 'Label for the filter by marriage option'
  },
  filtersAllStatuses: {
    id: 'myRecords.labels.statuses.all',
    defaultMessage: 'All statues',
    description: 'Label for the filter by all statuses option'
  },
  filtersApplication: {
    id: 'myRecords.labels.statuses.application',
    defaultMessage: 'Application',
    description: 'Label for the filter by application option'
  },
  filtersRegistered: {
    id: 'myRecords.labels.statuses.registered',
    defaultMessage: 'Registered',
    description: 'Label for the filter by registered option'
  },
  filtersRejected: {
    id: 'register.workQueue.statusLabel.rejected',
    defaultMessage: 'rejected',
    description: 'The status label for rejected'
  },
  filtersCollected: {
    id: 'myRecords.labels.statuses.collected',
    defaultMessage: 'Collected',
    description: 'Label for the filter by collected option'
  },
  listItemName: {
    id: 'myRecords.labels.results.name',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  listItemDob: {
    id: 'myRecords.labels.results.dob',
    defaultMessage: 'D.o.B',
    description: 'Label for DoB in work queue list item'
  },
  listItemDateOfApplication: {
    id: 'myRecords.labels.results.dateOfApplication',
    defaultMessage: 'Date of application',
    description: 'Label for date of application in work queue list item'
  },
  listItemTrackingNumber: {
    id: 'myRecords.labels.results.trackingID',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking ID in work queue list item'
  }
})

class MyRecordsComponent extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      data: {},
      enableConfirmButton: false
    }
  }
  getDeclarationStatusLabel = (status: string) => {
    switch (status) {
      case 'APPLICATION':
        return this.props.intl.formatMessage(messages.filtersApplication)
      case 'REGISTERED':
        return this.props.intl.formatMessage(messages.filtersRegistered)
      case 'REJECTED':
        return this.props.intl.formatMessage(messages.filtersRejected)
      case 'CERTIFIED':
        return this.props.intl.formatMessage(messages.filtersCollected)
      default:
        return this.props.intl.formatMessage(messages.filtersApplication)
    }
  }

  getEventLabel = (status: string) => {
    switch (status) {
      case 'birth':
        return this.props.intl.formatMessage(messages.filtersBirth)
      case 'death':
        return this.props.intl.formatMessage(messages.filtersDeath)
      case 'marriage':
        return this.props.intl.formatMessage(messages.filtersMarriage)
      default:
        return this.props.intl.formatMessage(messages.filtersBirth)
    }
  }
  getDeclarationStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLICATION':
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
      case 'REGISTERED':
        return (
          <StatusIcon>
            <StatusGreen />
          </StatusIcon>
        )
      case 'CERTIFIED':
        return (
          <StatusIconCollected>
            <StatusCollected />
          </StatusIconCollected>
        )
      default:
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
    }
  }

  renderCell = (
    item: { [key: string]: string & Array<{ type: string }> },
    key: number
  ): JSX.Element => {
    const info = []
    const status = []

    info.push({
      label: this.props.intl.formatMessage(messages.listItemName),
      value: item.name
    })
    info.push({
      label: this.props.intl.formatMessage(messages.listItemDob),
      value: item.dob
    })
    info.push({
      label: this.props.intl.formatMessage(messages.listItemDateOfApplication),
      value: item.date_of_application
    })

    info.push({
      label: this.props.intl.formatMessage(messages.listItemTrackingNumber),
      value: item.tracking_id
    })

    status.push({ icon: <StatusGray />, label: this.getEventLabel(item.event) })
    status.push({
      icon: this.getDeclarationStatusIcon(item.declaration_status),
      label: this.getDeclarationStatusLabel(item.declaration_status)
    })

    const expansionActions: JSX.Element[] = []

    expansionActions.push(
      <StyledPrimaryButton id={`reviewAndRegisterBtn_${item.tracking_id}`}>
        {'Button'}
      </StyledPrimaryButton>
    )
    return (
      <ListItem
        index={key}
        infoItems={info}
        statusItems={status}
        key={key}
        itemData={{}}
        expandedCellRenderer={() => (
          <ListItemExpansion actions={expansionActions} />
        )}
      />
    )
  }

  render = () => {
    const { backLabel, intl } = this.props
    const filterBy = {
      input: {
        label: intl.formatMessage(messages.filtersFilterBy)
      },
      selects: {
        name: '',
        options: [
          {
            name: 'event',
            options: [
              {
                value: '',
                label: intl.formatMessage(messages.filtersAllEvents)
              },
              {
                value: 'BIRTH',
                label: intl.formatMessage(messages.filtersBirth)
              },
              {
                value: 'DEATH',
                label: intl.formatMessage(messages.filtersDeath)
              },
              {
                value: 'MARRIAGE',
                label: intl.formatMessage(messages.filtersMarriage)
              }
            ],
            value: ''
          },
          {
            name: 'declaration_status',
            options: [
              {
                value: '',
                label: intl.formatMessage(messages.filtersAllStatuses)
              },
              {
                value: 'APPLICATION',
                label: intl.formatMessage(messages.filtersApplication)
              },
              {
                value: 'REGISTERED',
                label: intl.formatMessage(messages.filtersRegistered)
              },
              {
                value: 'CERTIFIED',
                label: intl.formatMessage(messages.filtersCollected)
              }
            ],
            value: ''
          }
        ]
      }
    }
    return (
      <ActionPage
        title={intl.formatMessage(messages.title)}
        backLabel={backLabel}
        goBack={this.props.goToHome}
      >
        <HeaderContent>
          <Container>
            <DataTable
              data={data}
              filterBy={filterBy}
              cellRenderer={this.renderCell}
              resultLabel={intl.formatMessage(messages.dataTableResults)}
              noResultText={intl.formatMessage(messages.dataTableNoResults)}
            />
          </Container>
        </HeaderContent>
      </ActionPage>
    )
  }
}
// export const MyRecords = injectIntl<IFullProps>(MyRecordsComponent)
export const MyRecords = connect(
  (state: IStoreState) => ({
    language: state.i18n.language
  }),
  { goToHome: goToHomeAction }
)(injectIntl(MyRecordsComponent))
