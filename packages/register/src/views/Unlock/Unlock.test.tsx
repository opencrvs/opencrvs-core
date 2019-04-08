import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { createStore } from 'src/store'
import { Unlock } from './Unlock'

describe('Unlock page loads Properly', () => {
  const { store } = createStore()
  const testComponent = createTestComponent(<Unlock />, store)

  it('Should load the Unlock page properly', () => {
    const elem = testComponent.component.find('#unlockPage').hostNodes().length
    expect(elem).toBe(1)
  })
})
