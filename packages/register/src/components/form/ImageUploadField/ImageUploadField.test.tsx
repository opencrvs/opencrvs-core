import * as React from 'react'
import { IntlProvider } from 'react-intl'
import { createShallowRenderedComponent } from 'src/tests/util'
import { ImageUploadField } from './ImageUploadField'
import { documentsSection } from 'src/forms/register/documents-section'
import { IImageUploaderWithOptionsFormField } from '@opencrvs/register/src/forms'

describe('image upload component', () => {
  const mock = jest.fn()
  const testComponent = createShallowRenderedComponent(
    <IntlProvider locale="en">
      <ImageUploadField
        id="image_uploader"
        title="Upload a photo of the supporting document"
        onComplete={mock}
        optionSection={
          (documentsSection.fields[0] as IImageUploaderWithOptionsFormField)
            .optionSection
        }
      />
    </IntlProvider>
  )

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})
