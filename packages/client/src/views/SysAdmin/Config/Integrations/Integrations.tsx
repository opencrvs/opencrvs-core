import { withOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'
import { connect } from 'formik'
import React, { useState } from 'react'
import { injectIntl } from 'react-intl'

interface IIntegration {
  name: string
  status: string // statuses
  systemId: string // This is not here now. It is added in a different ticket
}

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

export function IntegrationList() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
