import * as React from 'react'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import {
  ActionPage,
  ListItem,
  DataTable,
  SelectFieldType
} from '@opencrvs/components/lib/interface'
import styled from 'styledComponents'
import { SecondaryButton } from '@opencrvs/components/lib/buttons'
import { StatusGray, Edit } from '@opencrvs/components/lib/icons'
import {
  goToHome as goToHomeAction,
  goToBirthRegistrationAsParent
} from 'navigation'
import { IStoreState } from 'store'
import { IDraft } from 'drafts'
import moment from 'moment'

const Container = styled.div`
  margin: 0 ${({ theme }) => theme.grid.margin}px;
`
const StyledSecondaryButton = styled(SecondaryButton)`
  border: solid 1px ${({ theme }) => theme.colors.disabledButton};
  color: ${({ theme }) => theme.colors.primary} !important;
  font-weight: bold;
  svg {
    margin-right: 15px;
  }
  &:hover {
    background: inherit;
    border: solid 1px ${({ theme }) => theme.colors.disabledButton};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.colors.inputBackground};
  }
`
type IProps = {
  backLabel: string
  goToHome: typeof goToHomeAction
  goToBirthRegistrationAsParent: typeof goToBirthRegistrationAsParent
  drafts: IDraft[]
}

type IFullProps = InjectedIntlProps & IProps

const messages = defineMessages({
  title: {
    id: 'myDrafts.title',
    defaultMessage: 'My Drafts',
    description: 'The displayed title in the header'
  },
  dataTableResults: {
    id: 'register.workQueue.dataTable.results',
    defaultMessage: 'Results',
    description: 'Results label at the top of the data table component'
  },
  dataTableNoResults: {
    id: 'register.workQueue.dataTable.noResults',
    defaultMessage: 'No result to display',
    description:
      'Text to display if the search return no results for the current filters'
  },
  filtersAllEvents: {
    id: 'register.workQueue.labels.events.all',
    defaultMessage: 'All life events',
    description: 'Label for the filter by all events option'
  },
  filtersFilterBy: {
    id: 'register.workQueue.labels.selects.filter',
    defaultMessage: 'Filter by',
    description: 'Label for the filter by section of the filters'
  },
  filtersBirth: {
    id: 'register.workQueue.labels.events.birth',
    defaultMessage: 'Birth',
    description: 'Label for the filter by birth option'
  },
  filtersDeath: {
    id: 'register.workQueue.labels.events.death',
    defaultMessage: 'Death',
    description: 'Label for the filter by death option'
  },
  filtersMarriage: {
    id: 'register.workQueue.labels.events.marriage',
    defaultMessage: 'Marriage',
    description: 'Label for the filter by marriage option'
  },
  filtersSortBy: {
    id: 'register.workQueue.labels.selects.sort',
    defaultMessage: 'Sort By',
    description: 'Label for the sort by section of the filters'
  },
  filtersOldestToNewest: {
    id: 'register.workQueue.selects.sort.item0',
    defaultMessage: 'Oldest to newest',
    description: 'Label for the sort by oldest to newest option'
  },
  filtersNewestToOldest: {
    id: 'register.workQueue.selects.sort.item1',
    defaultMessage: 'Newest to oldest',
    description: 'Label for the sort by newest to oldest option'
  },
  listItemName: {
    id: 'myDrafts.labels.results.name',
    defaultMessage: 'Name',
    description: 'Label for name in my drafts list item'
  },
  listItemDob: {
    id: 'myDrafts.labels.results.dob',
    defaultMessage: 'D.o.B',
    description: 'Label for DoB in my drafts list item'
  },
  listItemSavedOn: {
    id: 'myDrafts.labels.results.savedOn',
    defaultMessage: 'Saved on',
    description: 'Label for draft last updated date'
  },
  listItemTrackingNumber: {
    id: 'myDrafts.labels.results.trackingID',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking ID in my drafts list item'
  }
})

class MyDraftsComponent extends React.Component<IFullProps, IDraft> {
  constructor(props: IFullProps) {
    super(props)
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
      label: this.props.intl.formatMessage(messages.listItemSavedOn),
      value: item.saved_on
    })

    info.push({
      label: this.props.intl.formatMessage(messages.listItemTrackingNumber),
      value: '-'
    })

    status.push({ icon: <StatusGray />, label: item.event })

    const listItemActions = []
    listItemActions.push({
      label: 'Edit',
      handler: () => this.props.goToBirthRegistrationAsParent(item.id)
    })

    const expansionActions: JSX.Element[] = []

    expansionActions.push(
      <StyledSecondaryButton
        id={`editBtn_${item.id}`}
        onClick={() => {
          this.props.goToBirthRegistrationAsParent(item.id)
        }}
      >
        <Edit />
        {'Edit'}
      </StyledSecondaryButton>
    )
    return (
      <ListItem
        index={key}
        infoItems={info}
        statusItems={status}
        key={key}
        itemData={{}}
        actions={listItemActions}
      />
    )
  }

  transformData = (drafts: IDraft[]) => {
    const data: any = []
    drafts.forEach((draft: IDraft) => {
      data.push({
        id: draft.id,
        name:
          (draft.data.child &&
            `${draft.data.child.firstNames} ${
              draft.data.child.familyName
            }`.trim()) ||
          '-',
        dob: (draft.data.child && draft.data.child.birthDate) || '-',
        saved_on: moment(draft.savedOn).format('YYYY-MM-DD'),
        event: draft.eventType,
        savedOn: draft.savedOn
      })
    })
    return data
  }

  render = () => {
    const { backLabel, intl } = this.props
    const sortBy = {
      input: {
        label: intl.formatMessage(messages.filtersSortBy)
      },
      selects: {
        name: '',
        options: [
          {
            name: 'savedOn',
            options: [
              {
                value: 'asc',
                label: intl.formatMessage(messages.filtersOldestToNewest)
              },
              {
                value: 'desc',
                label: intl.formatMessage(messages.filtersNewestToOldest)
              }
            ],
            value: 'desc',
            type: SelectFieldType.Date
          }
        ]
      }
    }
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
        <Container id="myDrafts">
          <DataTable
            data={this.transformData(this.props.drafts)}
            sortBy={sortBy}
            filterBy={filterBy}
            cellRenderer={this.renderCell}
            resultLabel={intl.formatMessage(messages.dataTableResults)}
            noResultText={intl.formatMessage(messages.dataTableNoResults)}
          />
        </Container>
      </ActionPage>
    )
  }
}

export const MyDrafts = connect(
  (state: IStoreState) => ({
    drafts: state.drafts.drafts,
    language: state.i18n.language
  }),
  { goToHome: goToHomeAction, goToBirthRegistrationAsParent }
)(injectIntl(MyDraftsComponent))
