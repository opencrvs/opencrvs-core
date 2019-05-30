import * as React from 'react'
import { BodyContent } from '@opencrvs/components/lib/layout'
import {
  GridTable,
  ColumnContentAlignment,
  Spinner
} from '@opencrvs/components/lib/interface'
import { injectIntl, InjectedIntlProps } from 'react-intl'

import { StatusWaiting } from '@opencrvs/components/lib/icons'

import { getTheme } from '@opencrvs/components/lib/theme'

import styled from 'src/styled-components'
import { connect } from 'react-redux'
import { IStoreState } from 'src/store'
import { IApplication, SUBMISSION_STATUS } from 'src/applications'
import { sentenceCase } from 'src/utils/data-formatting'
// import { IApplication, SUBMISSION_STATUS } from 'src/applications'

const messages = {
  statusWaitingToRegister: {
    id: 'register.fieldAgentHome.outbox.statusWaitingToRegister',
    defaultMessage: 'Waiting to register',
    description: 'Label for application status Ready to Submit'
  },
  statusWaitingToReject: {
    id: 'register.fieldAgentHome.outbox.statusWaitingToRegister',
    defaultMessage: 'Waiting to reject',
    description: 'Label for application status Ready to Submit'
  },
  statusSubmitting: {
    id: 'register.fieldAgentHome.outbox.statusSubmitting',
    defaultMessage: 'Registering...',
    description: 'Label for application status Submitting'
  },

  statusPendingConnection: {
    id: 'register.fieldAgentHome.outbox.statusPendingConnection',
    defaultMessage: 'Pending connection',
    description: 'Label for application status Pending Connection'
  },
  dataTableNoResults: {
    id: 'register.registrarHome.noResults',
    defaultMessage: 'No result to display',
    description:
      'Text to display if the search return no results for the current filters'
  },
  listItemType: {
    id: 'register.registrarHome.resultsType',
    defaultMessage: 'Type',
    description: 'Label for type of event in work queue list item'
  },
  name: {
    id: 'register.registrarHome.listItemName',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  }
}

const Container = styled(BodyContent)`
  padding-top: 32px;
`
const SmallSpinner = styled(Spinner)`
  width: 24px;
  height: 24px;
`

interface IState {
  sentForReviewPageNo: number
}
interface IProps {
  application: IApplication[]
}
type IFullProps = IProps & InjectedIntlProps
class Outbox extends React.Component<IFullProps, IState> {
  submissionStatusMap = (status: string, index: number) => {
    const { formatMessage } = this.props.intl
    const { statusWaitingToRegister, statusSubmitting } = messages

    let icon: () => React.ReactNode
    let statusText: string
    let iconId: string

    switch (status) {
      case SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTING]:
        iconId = `submitting${index}`
        icon = () => <SmallSpinner id={iconId} key={iconId} />
        statusText = formatMessage(statusSubmitting)
        break

      case SUBMISSION_STATUS[SUBMISSION_STATUS.READY_TO_SUBMIT]:
      default:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToRegister)
        break
    }

    return {
      icon,
      statusText
    }
  }

  transformApplicationsReadyToSend = () => {
    const allapplications = this.props.application
    return allapplications.map((application, index) => {
      let name
      if (application.event && application.event.toString() === 'birth') {
        name =
          (application.data &&
            application.data.child &&
            application.data.child.familyNameEng &&
            (!application.data.child.firstNamesEng
              ? ''
              : application.data.child.firstNamesEng + ' ') +
              application.data.child.familyNameEng) ||
          (application.data &&
            application.data.child &&
            application.data.child.familyName &&
            (!application.data.child.firstNames
              ? ''
              : application.data.child.firstNames + ' ') +
              application.data.child.familyName) ||
          ''
      } else if (
        application.event &&
        application.event.toString() === 'death'
      ) {
        name =
          (application.data &&
            application.data.deceased &&
            application.data.deceased.familyNameEng &&
            (!application.data.deceased.firstNamesEng
              ? ''
              : application.data.deceased.firstNamesEng + ' ') +
              application.data.deceased.familyNameEng) ||
          (application.data &&
            application.data.deceased &&
            application.data.deceased.familyName &&
            (!application.data.deceased.firstNames
              ? ''
              : application.data.deceased.firstNames + ' ') +
              application.data.deceased.familyName) ||
          ''
      }

      const { statusText, icon } = this.submissionStatusMap(
        application.submissionStatus || '',
        index
      )

      return {
        id: application.id,
        event: (application.event && sentenceCase(application.event)) || '',
        name: name || '',
        submission_status: statusText || '',
        status_indicator: icon ? [icon()] : null
      }
    })
  }

  onPageChange = (pageNumber: number) => {
    this.setState({ sentForReviewPageNo: pageNumber })
  }

  render() {
    const { intl } = this.props

    return (
      <Container>
        <GridTable
          hideTableHeader={true}
          content={this.transformApplicationsReadyToSend()}
          columns={[
            {
              label: this.props.intl.formatMessage(messages.listItemType),
              width: 15,
              key: 'event'
            },
            {
              width: 45,
              label: this.props.intl.formatMessage(messages.name),
              key: 'name'
            },
            {
              label: this.props.intl.formatMessage(
                messages.statusWaitingToRegister
              ),
              width: 35,
              key: 'submission_status',
              color: getTheme(window.config.COUNTRY, window.config.LANGUAGE)
                .colors.secondaryLabel
            },
            {
              label: '',
              width: 5,
              alignment: ColumnContentAlignment.CENTER,
              key: 'status_indicator'
            }
          ]}
          noResultText={intl.formatMessage(messages.dataTableNoResults)}
          totalPages={10}
          onPageChange={this.onPageChange}
          pageSize={10}
        />
      </Container>
    )
  }
}

function mapStatetoProps(state: IStoreState) {
  const application = state.applicationsState.applications

  return {
    application
  }
}

export default connect(
  mapStatetoProps,
  {}
)(injectIntl(Outbox))
