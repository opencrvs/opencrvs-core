import * as React from 'react'
import { createShallowRenderedComponent } from '../tests/util'
import { ViewHeader } from './ViewHeader'

describe('view header component', () => {
  const testComponent = createShallowRenderedComponent(
    <ViewHeader
      id="test_heaader"
      title="Test title"
      description="Test description"
    />
  )

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})
