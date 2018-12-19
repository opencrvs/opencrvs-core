import { createTestComponent } from 'src/tests/util'
import { WarningMessage } from './WarningMessage'
import { createStore } from 'src/store'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'

describe('renders warning with a title', () => {
  const { store } = createStore()
  let warningMessageComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = createTestComponent(
      <WarningMessage>Test warning message</WarningMessage>,
      store
    )
    warningMessageComponent = testComponent.component
  })

  it('renders the title provided as children', () => {
    expect(warningMessageComponent.text()).toBe('Test warning message')
  })
})
