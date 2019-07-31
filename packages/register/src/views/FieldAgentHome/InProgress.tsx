import * as React from 'react'
import { HomeContent } from '@opencrvs/components/lib/layout'
import { GridTable } from '@opencrvs/components/lib/interface'
import { IApplication } from '@register/applications'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { sentenceCase } from '@register/utils/data-formatting'
import moment from 'moment'
import { goToApplicationDetails } from '@register/navigation'
import { withTheme, ITheme } from '@register/styledComponents'

interface IInProgressProps {
  theme: ITheme
  draftApplications: IApplication[]
  goToApplicationDetails: typeof goToApplicationDetails
}

type IFullProps = IInProgressProps & InjectedIntlProps

interface IState {
  inProgressPageNo: number
  width: number
}

const messages = {
  listItemType: {
    id: 'register.registrarHome.resultsType',
    defaultMessage: 'Type',
    description: 'Label for type of event in work queue list item'
  },
  listItemName: {
    id: 'register.registrarHome.listItemName',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  listItemModificationDate: {
    id: 'register.registrarHome.results.modificationDate',
    defaultMessage: 'Last edited',
    description: 'Label for rejection date in work queue list item'
  },
  dataTableNoResults: {
    id: 'register.registrarHome.noResults',
    defaultMessage: 'No result to display',
    description:
      'Text to display if the search return no results for the current filters'
  }
}

class InProgressComponent extends React.Component<IFullProps, IState> {
  pageSize: number

  constructor(props: IFullProps) {
    super(props)

    this.pageSize = 10
    this.state = {
      width: window.innerWidth,
      inProgressPageNo: 1
    }
  }

  transformDraftContent = () => {
    if (
      !this.props.draftApplications ||
      this.props.draftApplications.length <= 0
    ) {
      return []
    }

    return this.props.draftApplications.map((draft: IApplication) => {
      let name
      if (draft.event && draft.event.toString() === 'birth') {
        name =
          (draft.data &&
            draft.data.child &&
            draft.data.child.familyNameEng &&
            (!draft.data.child.firstNamesEng
              ? ''
              : draft.data.child.firstNamesEng + ' ') +
              draft.data.child.familyNameEng) ||
          (draft.data &&
            draft.data.child &&
            draft.data.child.familyName &&
            (!draft.data.child.firstNames
              ? ''
              : draft.data.child.firstNames + ' ') +
              draft.data.child.familyName) ||
          ''
      } else if (draft.event && draft.event.toString() === 'death') {
        name =
          (draft.data &&
            draft.data.deceased &&
            draft.data.deceased.familyNameEng &&
            (!draft.data.deceased.firstNamesEng
              ? ''
              : draft.data.deceased.firstNamesEng + ' ') +
              draft.data.deceased.familyNameEng) ||
          (draft.data &&
            draft.data.deceased &&
            draft.data.deceased.familyName &&
            (!draft.data.deceased.firstNames
              ? ''
              : draft.data.deceased.firstNames + ' ') +
              draft.data.deceased.familyName) ||
          ''
      }
      const lastModificationDate = draft.modifiedOn || draft.savedOn

      return {
        id: draft.id,
        event: (draft.event && sentenceCase(draft.event)) || '',
        name: name || '',
        dateOfModification:
          `Last updated ${lastModificationDate &&
            moment(lastModificationDate).fromNow()}` || '',
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () => this.props.goToApplicationDetails(draft.id)
          }
        ]
      }
    })
  }

  componentDidMount() {
    window.addEventListener('resize', this.recordWindowWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recordWindowWidth)
  }

  recordWindowWidth = () => {
    this.setState({ width: window.innerWidth })
  }

  onPageChange = (newPageNumber: number) => {
    this.setState({ inProgressPageNo: newPageNumber })
  }

  getColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.md) {
      return [
        {
          label: this.props.intl.formatMessage(messages.listItemType),
          width: 20,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(messages.listItemName),
          width: 40,
          key: 'name',
          errorValue: 'No name provided'
        },
        {
          label: this.props.intl.formatMessage(
            messages.listItemModificationDate
          ),
          width: 40,
          key: 'dateOfModification'
        }
      ]
    } else {
      return [
        {
          label: this.props.intl.formatMessage(messages.listItemType),
          width: 30,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(messages.listItemName),
          width: 70,
          key: 'name',
          errorValue: 'No name provided'
        }
      ]
    }
  }

  render() {
    const { draftApplications, intl } = this.props

    return (
      <HomeContent>
        <GridTable
          content={this.transformDraftContent()}
          columns={this.getColumns()}
          noResultText={intl.formatMessage(messages.dataTableNoResults)}
          onPageChange={(currentPage: number) => {
            this.onPageChange(currentPage)
          }}
          pageSize={this.pageSize}
          totalItems={draftApplications && draftApplications.length}
          currentPage={this.state.inProgressPageNo}
          expandable={false}
          clickable={true}
        />
      </HomeContent>
    )
  }
}

export const InProgress = connect(
  null,
  { goToApplicationDetails }
)(injectIntl(withTheme(InProgressComponent)))
