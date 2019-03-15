import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { MyRecords } from './MyRecords'
import { createStore } from 'src/store'

describe('MyRecords tests', async () => {
  it('sets loading state while waiting for data', () => {
    const { store } = createStore()
    const testComponent = createTestComponent(
      // @ts-ignore
      <MyRecords />,
      store
    )

    testComponent.component.unmount()
  })
})
