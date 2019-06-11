import * as React from 'react'
import { ExpandableNotification } from '@opencrvs/components/lib/interface'
import styled from 'src/styled-components'
import { connect } from 'react-redux'
import { IStoreState } from 'src/store'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import Outbox from './Outbox'
import { IApplication } from 'src/applications'

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
  total: number
}
class NotificationToast extends React.Component<IFullProps, IState> {
  state = {
    total: 0
  }
  componentDidMount() {
    const total = this.props.application.length
    this.setState({ total })
  }

  render() {
    return (
      <ExpandableNotificationContainer>
        <ExpandableNotification
          outboxText={this.props.intl.formatMessage(messages.outboxText, {
            num: this.state.total
          })}
          processingText={this.props.intl.formatMessage(
            messages.processingText,
            {
              num: this.state.total
            }
          )}
        >
          <Outbox application={this.props.application} />
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
