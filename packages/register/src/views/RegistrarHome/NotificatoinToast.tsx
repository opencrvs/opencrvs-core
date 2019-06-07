import * as React from 'react'
import { ExpandableNotification } from '@opencrvs/components/lib/interface'
import styled from '@register/styledComponents'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'

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
const NotificationToast = (props: InjectedIntlProps) => (
  <ExpandableNotificationContainer>
    <ExpandableNotification
      outboxText={props.intl.formatMessage(messages.outboxText, { num: 4 })}
      processingText={props.intl.formatMessage(messages.processingText, {
        num: 2
      })}
    >
      <h2>Hello from the outbox!</h2>
    </ExpandableNotification>
  </ExpandableNotificationContainer>
)
export default injectIntl(NotificationToast)
