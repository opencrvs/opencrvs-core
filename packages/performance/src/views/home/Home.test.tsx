import * as React from 'react'
import { Home } from './Home'
import { ReactWrapper } from 'enzyme'
import { createStore } from 'src/store'
import { createTestComponent } from 'src/tests/util'

const { store } = createStore()

describe('when user is in the home page', () => {
  let homeComponent: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const testComponent = createTestComponent(<Home />, store)
    homeComponent = testComponent.component
  })

  it('renders box title', () => {
    expect(
      homeComponent
        .find('#box_title')
        .hostNodes()
        .text()
    ).toBe('Birth Registration Key Figures')
  })

  it('renders bar chart box title', () => {
    expect(
      homeComponent
        .find('#bar_chart_box_title')
        .hostNodes()
        .text()
    ).toBe('At What Age Are Births Registered In Children Aged 0-10 Years')
  })

  it('renders footer text', () => {
    expect(
      homeComponent
        .find('#footer_text')
        .hostNodes()
        .text()
    ).toBe('Estimates provided using National Population Census data')
  })
})
