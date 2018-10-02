import * as React from 'react'
import { createShallowRenderedComponent } from '../tests/util'
import { HomeViewHeader } from './HomeViewHeader'

describe('home view header component', () => {
  const testComponent = createShallowRenderedComponent(<HomeViewHeader />)

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})
