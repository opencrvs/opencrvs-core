import * as React from 'react'
import { createTestComponent } from '../tests/util'
import { MobileHeader } from './MobileHeader'
import { Hamburger, SearchDark } from '@opencrvs/components/lib/icons'
import { createStore } from 'src/store'

describe('mobile header component', () => {
  const { store } = createStore()

  it('renders without crashing', () => {
    const component = createTestComponent(
      <MobileHeader id="register_mobile_header" title="Mobile header" />,
      store
    ).component
    expect(component.find('#register_mobile_header').hostNodes()).toHaveLength(
      1
    )

    expect(
      component
        .find('#header_title')
        .hostNodes()
        .text()
    ).toBe('Mobile header')
  })

  it('menu actions function properly', () => {
    const leftHandlerMock = jest.fn()
    const rightHandlerMock = jest.fn()

    const component = createTestComponent(
      <MobileHeader
        id="register_mobile_header"
        left={{ icon: () => <Hamburger />, handler: leftHandlerMock }}
        title="Mobile header"
        right={{ icon: () => <SearchDark />, handler: rightHandlerMock }}
      />,
      store
    ).component
    expect(component.find('#register_mobile_header').hostNodes()).toHaveLength(
      1
    )

    component
      .find('#mobile_header_left')
      .hostNodes()
      .simulate('click')

    expect(leftHandlerMock.mock.calls).toHaveLength(1)

    component
      .find('#mobile_header_right')
      .hostNodes()
      .simulate('click')
    expect(rightHandlerMock.mock.calls).toHaveLength(1)
  })
})
