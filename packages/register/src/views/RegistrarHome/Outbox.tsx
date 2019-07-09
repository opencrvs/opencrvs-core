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

import styled from '@register/styledComponents'

import { IApplication, SUBMISSION_STATUS } from '@register/applications'
import { sentenceCase } from '@register/utils/data-formatting'

const messages = {
  statusWaitingToRegister: {
    id: 'register.registrarHome.outbox.statusWaitingToRegister',
    defaultMessage: 'Waiting to register',
    description: 'Label for application status waiting for register'
  },
  statusWaitingToReject: {
    id: 'register.registrarHome.outbox.statusWaitingToReject',
    defaultMessage: 'Waiting to reject',
    description: 'Label for application status waiting for reject'
  },
  statusWaitingToSubmit: {
    id: 'register.registrarHome.outbox.statusWaitingToSubmit',
    defaultMessage: 'Waiting to submit',
    description: 'Label for application status waiting for reject'
  },
  statusRegistering: {
    id: 'register.registrarHome.outbox.statusRegistering',
    defaultMessage: 'Registering...',
    description: 'Label for application status Registering'
  },
  statusRejecting: {
    id: 'register.registrarHome.outbox.statusRejecting',
    defaultMessage: 'Rejecting...',
    description: 'Label for application status Rejecting'
  },
  statusSubmitting: {
    id: 'register.registrarHome.outbox.statusSubmitting',
    defaultMessage: 'Submitting...',
    description: 'Label for application status submitting'
  },

  // end of status type
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
  },
  waitingToRetry: {
    id: 'register.registrarHome.outbox.waitingToRetry'
  }
}

const Container = styled(BodyContent)`
  padding-top: 32px;
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
    const {
      statusWaitingToRegister,
      statusRegistering,
      statusWaitingToReject,
      statusRejecting,
      statusWaitingToSubmit,
      statusSubmitting,
      waitingToRetry
    } = messages

    let icon: () => React.ReactNode
    let statusText: string
    let iconId: string

    switch (status) {
      case SUBMISSION_STATUS.READY_TO_SUBMIT:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToSubmit)
        break
      case SUBMISSION_STATUS.SUBMITTING:
        iconId = `registering${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(statusSubmitting)
        break
      case SUBMISSION_STATUS.REGISTERING:
        iconId = `registering${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(statusRegistering)
        break
      case SUBMISSION_STATUS.READY_TO_REJECT:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToReject)
        break
      case SUBMISSION_STATUS.REJECTING:
        iconId = `rejecting${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(statusRejecting)
        break
      case SUBMISSION_STATUS.FAILED_NETWORK:
        iconId = `failed${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(waitingToRetry)
        break
      default:
        // default act as  SUBMISSION_STATUS[SUBMISSION_STATUS.READY_TO_REGISTER]:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToRegister)
    }

    return {
      icon,
      statusText
    }
  }

  transformApplicationsReadyToSend = () => {
    const allapplications = this.props.application || []
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
        submissionStatus: statusText || '',
        statusIndicator: icon ? [icon()] : null
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
              key: 'submissionStatus',
              color: getTheme(window.config.COUNTRY, window.config.LANGUAGE)
                .colors.secondaryLabel
            },
            {
              label: '',
              width: 5,
              alignment: ColumnContentAlignment.CENTER,
              key: 'statusIndicator'
            }
          ]}
          noResultText={intl.formatMessage(messages.dataTableNoResults)}
          totalItems={10}
          onPageChange={this.onPageChange}
          pageSize={10}
        />
      </Container>
    )
  }
}

export default injectIntl(Outbox)
