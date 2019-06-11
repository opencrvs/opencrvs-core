import * as React from 'react'
import { ExpandableNotification } from '@opencrvs/components/lib/interface'
import styled from 'src/styled-components'
import { connect } from 'react-redux'
import { IStoreState } from 'src/store'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import Outbox from './Outbox'
import { IApplication, SUBMISSION_STATUS } from 'src/applications'

const messages = defineMessages({
  processingText: {
    id: 'register.registrarHome.notificationToast.processingText',
    defaultMessage: '{num} application processing...',
    description: 'Application processing text'
  },
  outboxText: {
    id: 'register.registrarHome.notificationToast.outboxText',
    defaultMessage: 'Outbox({num})',
    description: 'Application outbox text'
  }
})
const ExpandableNotificationContainer = styled.div`
  display: flex;
  bottom: 0;
  position: fixed;
  width: 100%;
  flex-direction: column;
`

interface IProps {
  application: IApplication[]
}
type IFullProps = IProps & InjectedIntlProps

interface IState {
  outboxData: any
}
class NotificationToast extends React.Component<IFullProps, IState> {
  state = {
    outboxData: []
  }
  componentDidMount() {
    const outboxData = this.props.application.filter(
      item =>
        item.submissionStatus === SUBMISSION_STATUS.READY_TO_REGISTER ||
        item.submissionStatus === SUBMISSION_STATUS.READY_TO_REJECT ||
        item.submissionStatus === SUBMISSION_STATUS.REGISTERING ||
        item.submissionStatus === SUBMISSION_STATUS.REJECTING
    )
    this.setState({ outboxData })
  }

  render() {
    return (
      <ExpandableNotificationContainer>
        <ExpandableNotification
          outboxText={this.props.intl.formatMessage(messages.outboxText, {
            num: this.state.outboxData.length
          })}
          processingText={this.props.intl.formatMessage(
            messages.processingText,
            {
              num: this.state.outboxData.length
            }
          )}
        >
          <Outbox application={this.state.outboxData} />
        </ExpandableNotification>
      </ExpandableNotificationContainer>
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
)(injectIntl(NotificationToast))
