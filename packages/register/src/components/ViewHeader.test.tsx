import * as React from 'react'
import { createShallowRenderedComponent } from '@register/tests/util'
import { ViewHeader } from '@register/components/ViewHeader'

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

describe('view header component with logo', () => {
  const hideBackButton = true
  const testComponent = createShallowRenderedComponent(
    <ViewHeader
      id="test_heaader"
      title="Test title"
      description="Test description"
      hideBackButton={hideBackButton}
    />
  )

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})
