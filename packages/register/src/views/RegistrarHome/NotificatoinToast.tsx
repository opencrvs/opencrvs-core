import * as React from 'react'
import { ExpandableNotification } from '@opencrvs/components/lib/interface'
import styled from 'src/styled-components'
const ExpandableNotificationContainer = styled.div`
  display: flex;
  bottom: 0;
  position: fixed;
  width: 100%;
  flex-direction: column;
`
const NotificationToast = () => (
  <ExpandableNotificationContainer>
    <ExpandableNotification processing={2} total={10}>
      <h2>Hello from the other world</h2>
    </ExpandableNotification>
  </ExpandableNotificationContainer>
)
export default NotificationToast
