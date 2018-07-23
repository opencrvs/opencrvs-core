import { StepTwoContainer } from './StepTwoContainer'
import * as React from 'react'
import { createTestComponent, mockState, createTestState } from '../tests/util'
import { MockStoreEnhanced } from 'redux-mock-store'

interface ITestProps {
  test: string
}

describe('Step Two Container test', () => {
  let props: ITestProps
  const store: MockStoreEnhanced = createTestState(mockState)
  beforeEach(() => {
    props = {
      test: ''
    }
  })
  it('Renders successfully', () => {
    const container = createTestComponent(
      <StepTwoContainer {...props} />,
      store
    )
    expect(container.find('form#STEP_TWO')).toHaveLength(1)
  })
})
