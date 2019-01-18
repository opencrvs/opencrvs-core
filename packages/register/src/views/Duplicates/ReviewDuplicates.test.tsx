import * as React from 'react'
import { createTestComponent } from '../../tests/util'
import { ReviewDuplicates } from './ReviewDuplicates'
import { createStore } from 'src/store'

describe('home view header component', () => {
  it('renders without crashing', () => {
    const { store, history } = createStore()
    const mock: any = jest.fn()

    const testComponent = createTestComponent(
      <ReviewDuplicates
        location={mock}
        history={history}
        match={{
          params: { applicationId: '' },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )
    expect(testComponent).toBeDefined()
  })
})
