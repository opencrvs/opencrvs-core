import * as React from 'react'
import { createShallowRenderedComponent } from '@register/tests/util'
import { ImagePreview } from '@register/components/form/ImageUploadField/ImagePreview'

describe('image upload component', () => {
  const mock = jest.fn()
  const testComponent = createShallowRenderedComponent(
    <ImagePreview
      previewImage={{
        optionValues: [],
        type: 'image/png',
        data: 'dummy base64 data'
      }}
      goBack={mock}
    />
  )

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})
