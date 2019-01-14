import * as React from 'react'
import { ReactWrapper } from 'enzyme'
import { createStore } from 'src/store'
import { createTestComponent } from 'src/tests/util'
import { SessionExpireConfirmation } from './SessionExpireConfirmation'

const { store } = createStore()

describe('when session expired modal is open', () => {
  let sessionExpireComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = createTestComponent(
      <SessionExpireConfirmation />,
      store
    )
    sessionExpireComponent = testComponent.component
  })

  it('renders session expire confirmation dialog', () => {
    expect(sessionExpireComponent.find('#login').hostNodes()).toHaveLength(1)
  })

  it('calls login button handler', () => {
    sessionExpireComponent
      .find('#login')
      .hostNodes()
      .simulate('click')
  })
})
