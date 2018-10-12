import * as React from 'react'
import { createShallowRenderedComponent } from '../tests/util'
import { UploadPhotoAction } from './UploadPhotoAction'

describe('upload photo documents action component', () => {
  const testComponent = createShallowRenderedComponent(
    <UploadPhotoAction title="Upload Photo" />
  )

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})
