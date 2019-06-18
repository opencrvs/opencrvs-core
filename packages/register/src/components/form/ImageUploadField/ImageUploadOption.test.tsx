import * as React from 'react'
import { createShallowRenderedComponent } from '@register/tests/util'
import { ImageUploadOption } from '@register/components/form/ImageUploadField/ImageUploadOption'
import { documentsSection } from '@register/forms/register/fieldDefinitions/birth/documents-section'
import { IImageUploaderWithOptionsFormField } from '@opencrvs/register/src/forms'
import { IntlProvider } from 'react-intl'

describe('image upload component', () => {
  const mock = jest.fn()
  const testComponent = createShallowRenderedComponent(
    <IntlProvider locale="en">
      <ImageUploadOption
        option={
          (documentsSection.fields[0] as IImageUploaderWithOptionsFormField)
            .optionSection
        }
        onComplete={mock}
        toggleNestedSection={mock}
      />
    </IntlProvider>
  )

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})
