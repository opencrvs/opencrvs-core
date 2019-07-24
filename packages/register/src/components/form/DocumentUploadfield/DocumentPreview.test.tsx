import * as React from 'react'
import { createShallowRenderedComponent } from '@register/tests/util'
import { DocumentPreview } from '@register/components/form/DocumentUploadfield/DocumentPreview'

describe('image upload component', () => {
  const mock = jest.fn()
  const testComponent = createShallowRenderedComponent(
    <DocumentPreview
      previewImage={{
        optionValues: [],
        type: 'image/png',
        data: 'dummy base64 data'
      }}
      goBack={mock}
      onDelete={mock}
    />
  )

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})
