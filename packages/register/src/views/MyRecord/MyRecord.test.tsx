import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { MyRecordAction } from './MyRecord'
import { createStore } from 'src/store'

describe('MyRecords tests', async () => {
  it('sets loading state while waiting for data', () => {
    const { store } = createStore()
    const testComponent = createTestComponent(
      // @ts-ignore
      <MyRecordAction />,
      store
    )

    testComponent.component.unmount()
  })
})
