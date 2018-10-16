import * as React from 'react'
import {
  createShallowRenderedComponent,
  createTestComponent
} from '../tests/util'
import {
  UploadPhotoAction,
  StyledIcon,
  PhotoIconAction
} from './UploadPhotoAction'
import { createStore } from '../store'

describe('upload photo documents action component', () => {
  const { store } = createStore()
  const mockCallBack = jest.fn()
  const testComponent = createShallowRenderedComponent(
    <UploadPhotoAction title="Upload Photo" onClick={mockCallBack} />
  )

  const iconTestComponent = createTestComponent(
    <StyledIcon id="styled-icon" />,
    store
  ).component

  const iconActionTestComponent = createTestComponent(
    <PhotoIconAction
      id="styled-icon-action"
      icon={() => <StyledIcon id="styled-icon" />}
      title="Upload Photo"
    />,
    store
  ).component

  it('renders an icon passed as a prop', () => {
    expect(iconTestComponent.find('#styled-icon').hostNodes()).toHaveLength(1)
  })

  it("adds the 'id' prop to the rendered element", () => {
    expect(
      iconActionTestComponent.find('#styled-icon-action').hostNodes()
    ).toHaveLength(1)
  })

  it("renders the 'title' prop as a text inside the element", () => {
    expect(testComponent.prop('title')).toMatch('Upload Photo')
  })

  it('handles click event', () => {
    testComponent.simulate('click')
    expect(mockCallBack.mock.calls).toHaveLength(1)
  })
})
