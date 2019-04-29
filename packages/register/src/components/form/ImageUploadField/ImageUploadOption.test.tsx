import * as React from 'react'
import { createShallowRenderedComponent } from 'tests/util'
import { ImageUploadOption } from './ImageUploadOption'
import { documentsSection } from 'forms/register/fieldDefinitions/birth/documents-section'
import { IImageUploaderWithOptionsFormField } from 'forms'

describe('image upload component', () => {
  const mock = jest.fn()
  const testComponent = createShallowRenderedComponent(
    <ImageUploadOption
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
