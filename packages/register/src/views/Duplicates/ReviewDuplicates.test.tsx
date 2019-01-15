import * as React from 'react'
import { createTestComponent } from '../../tests/util'
import { ReviewDuplicates } from './ReviewDuplicates'
import { createStore } from 'src/store'

describe('home view header component', () => {
  it('renders without crashing', () => {
    const { store } = createStore()
    const testComponent = createTestComponent(<ReviewDuplicates />, store)
    expect(testComponent).toBeDefined()
  })
})
