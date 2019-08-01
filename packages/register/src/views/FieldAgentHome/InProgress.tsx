import * as React from 'react'
import { BodyContent } from '@opencrvs/components/lib/layout'
import { GridTable } from '@opencrvs/components/lib/interface'
import { IApplication } from '@register/applications'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { sentenceCase } from '@register/utils/data-formatting'
import moment from 'moment'
import { goToApplicationDetails } from '@register/navigation'
import { constantsMessages as messages } from '@register/i18n/messages'

interface IInProgressProps {
  draftApplications: IApplication[]
  goToApplicationDetails: typeof goToApplicationDetails
}

type IFullProps = IInProgressProps & InjectedIntlProps

interface IState {
  inProgressPageNo: number
}

class InProgressComponent extends React.Component<IFullProps, IState> {
  pageSize: number

  constructor(props: IFullProps) {
    super(props)

    this.pageSize = 10
    this.state = { inProgressPageNo: 1 }
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

  onPageChange = (newPageNumber: number) => {
    this.setState({ inProgressPageNo: newPageNumber })
  }

  render() {
    const { draftApplications, intl } = this.props

    return (
      <BodyContent>
        <GridTable
          content={this.transformDraftContent()}
          columns={[
            {
              label: this.props.intl.formatMessage(messages.type),
              width: 20,
              key: 'event'
            },
            {
              label: this.props.intl.formatMessage(messages.name),
              width: 40,
              key: 'name',
              errorValue: 'No name provided'
            },
            {
              label: this.props.intl.formatMessage(messages.lastEdited),
              width: 40,
              key: 'dateOfModification'
            }
          ]}
          noResultText={intl.formatMessage(messages.noResults)}
          onPageChange={(currentPage: number) => {
            this.onPageChange(currentPage)
          }}
          pageSize={this.pageSize}
          totalItems={draftApplications && draftApplications.length}
          currentPage={this.state.inProgressPageNo}
          expandable={false}
          clickable={true}
        />
      </BodyContent>
    )
  }
}

export const InProgress = connect(
  null,
  { goToApplicationDetails }
)(injectIntl(InProgressComponent))
