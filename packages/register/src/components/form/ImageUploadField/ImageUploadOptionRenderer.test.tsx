import * as React from 'react'
import { createShallowRenderedComponent } from 'src/tests/util'
import { ImageUploadOptionRenderer } from './ImageUploadOptionRenderer'
import { documentsSection } from 'src/forms/register/documents-section'
import { IImageUploaderWithOptionsFormField } from '@opencrvs/register/src/forms'

describe('image upload component', () => {
  const mock = jest.fn()
  const testComponent = createShallowRenderedComponent(
    <ImageUploadOptionRenderer
      option={
        (documentsSection.fields[0] as IImageUploaderWithOptionsFormField)
          .optionSection
      }
      onComplete={mock}
      toggleNestedSection={mock}
    />
  )

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})
