/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import styled from 'styled-components'
import {
  EventConfig,
  FieldType,
  tennisClubMembershipEvent,
  AddressField,
  AddressType,
  getDeclaration,
  UUID
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { Review } from '@client/v2-events/features/events/components/Review'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { useFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'

const addressField = {
  id: 'storybook.address',
  type: FieldType.ADDRESS,
  label: {
    id: 'storybook.address.label',
    defaultMessage: 'Address',
    description: 'The title for the address input'
  }
} satisfies AddressField

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/Address',
  parameters: {
    layout: 'centered'
  },
  component: StyledFormFieldGenerator,
  args: {
    id: 'address-form',
    fields: [addressField]
  },
  decorators: [
    (Story, context) => (
      <TRPCProvider>
        <Story {...context} />
      </TRPCProvider>
    ),
    withValidatorContext
  ]
}

export default meta

type FormStory = StoryObj<typeof FormFieldGenerator>

const leafAdminStructureLocationId =
  '1d4e5f6a-7b8c-4912-8efa-345678901234' as UUID

export const DefaultAddressField: FormStory = {
  name: 'Empty address input'
}

export const AddressFieldWithRequiredError: FormStory = {
  name: 'Address field with lowest admin level required error',
  args: {
    formValues: {
      'storybook.address': {
        country: 'BGD',
        addressType: AddressType.DOMESTIC,
        administrativeArea: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c'
      }
    },
    formTouched: {
      'storybook.address': {
        country: true,
        administrativeArea: true
      }
    },
    fields: [
      {
        ...addressField,
        required: true
      }
    ]
  }
}

export const AddressFieldWithRequiredInternationalFields: FormStory = {
  name: 'Address field with required international field errors',
  args: {
    formValues: {
      'storybook.address': {
        country: 'ALB'
      }
    },
    formTouched: {
      'storybook.address': {
        country: true,
        streetLevelDetails: {
          state: true,
          district: true
        }
      }
    },
    fields: [
      {
        ...addressField,
        configuration: {
          streetAddressForm: [
            {
              id: 'state',
              required: true,
              label: {
                id: 'field.address.state.label',
                defaultMessage: 'State',
                description: 'This is the label for the field'
              },
              type: FieldType.TEXT
            },
            {
              id: 'district',
              required: true,
              label: {
                id: 'field.address.district.label',
                defaultMessage: 'District',
                description: 'This is the label for the field'
              },
              type: FieldType.TEXT
            }
          ]
        }
      }
    ]
  }
}

export const AddressFieldWithUserPrimaryOfficeAddress: FormStory = {
  name: 'Defaults to user primary office address',
  args: {
    fields: [
      {
        ...addressField,
        defaultValue: {
          country: 'BGD',
          addressType: AddressType.DOMESTIC,
          administrativeArea: {
            $userField: 'primaryOfficeId',
            $location: 'district'
          }
        },
        configuration: {
          streetAddressForm: [
            {
              id: 'town',
              required: false,
              label: {
                id: 'field.address.town.label',
                defaultMessage: 'Town',
                description: 'This is the label for the field'
              },
              type: FieldType.TEXT
            },
            {
              id: 'residentialArea',
              required: false,
              label: {
                id: 'field.address.residentialArea.label',
                defaultMessage: 'Residential Area',
                description: 'This is the label for the field'
              },
              type: FieldType.TEXT
            },
            {
              id: 'street',
              required: false,
              label: {
                id: 'field.address.street.label',
                defaultMessage: 'Street',
                description: 'This is the label for the field'
              },
              type: FieldType.TEXT
            },
            {
              id: 'number',
              required: false,
              label: {
                id: 'field.address.number.label',
                defaultMessage: 'Number',
                description: 'This is the label for the field'
              },
              type: FieldType.TEXT
            },
            {
              id: 'zipCode',
              required: false,
              label: {
                id: 'field.address.postcodeOrZip.label',
                defaultMessage: 'Postcode / Zip',
                description: 'This is the label for the field'
              },
              type: FieldType.TEXT
            }
          ]
        }
      }
    ]
  }
}

const eventConfig: EventConfig = tennisClubMembershipEvent

const declarationForm = getDeclaration(eventConfig)

type ReviewStory = StoryObj<typeof Review.Body>

export const AddressReviewInvalid: ReviewStory = {
  name: 'Review output (Invalid)',
  render: function Component(args) {
    return (
      <Review.Body
        {...args}
        form={{
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054d' as UUID // random uuid
          }
        }}
        formConfig={declarationForm}
        title="My address form with address output"
        // eslint-disable-next-line no-console
        onEdit={(values) => console.log(values)}
      >
        <div />
      </Review.Body>
    )
  }
}
export const AddressReviewEmpty: ReviewStory = {
  name: 'Review output (Empty)',
  render: function Component(args) {
    return (
      <Review.Body
        {...args}
        form={{}}
        formConfig={declarationForm}
        title="My address form with address output"
        // eslint-disable-next-line no-console
        onEdit={(values) => console.log(values)}
      >
        <div />
      </Review.Body>
    )
  }
}
export const AddressReviewChanged: ReviewStory = {
  name: 'Review with changed address',
  render: function Component(args) {
    return (
      <Review.Body
        {...args}
        form={{
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: leafAdminStructureLocationId,
            streetLevelDetails: {
              town: 'Example Town',
              residentialArea: 'Example Residential Area',
              street: 'Example Street',
              number: '55',
              zipCode: '123456',
              state: 'Example State',
              district2: 'Example District 2'
            }
          }
        }}
        formConfig={declarationForm}
        previousFormValues={{
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: leafAdminStructureLocationId,
            streetLevelDetails: {
              town: 'Example Village',
              district2: 'Old District 2'
            }
          }
        }}
        title="My address form with address changed"
        // eslint-disable-next-line no-console
        onEdit={(values) => console.log(values)}
      >
        <div />
      </Review.Body>
    )
  }
}
export const AddressInCopy: ReviewStory = {
  name: 'Address to string',
  render: function Component() {
    const allFields = declarationForm.pages.map((page) => page.fields).flat()
    const stringifier = useFormDataStringifier()
    const flattenedIntl = useIntlFormatMessageWithFlattenedParams()
    const FORM_DATA = {
      'applicant.address': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: leafAdminStructureLocationId,
        streetLevelDetails: {
          town: 'Example Town',
          residentialArea: 'Example Residential Area',
          street: 'Example Street',
          number: '55',
          zipCode: '123456'
        }
      }
    }
    return (
      <div>
        <p>
          {flattenedIntl.formatMessage(
            {
              id: 'storybook.address.example',
              defaultMessage:
                "This is an example of using formatMessage to format applicant's province: {applicant.address.province}"
            },
            stringifier(allFields, FORM_DATA)
          )}
        </p>
        <pre>{JSON.stringify(stringifier(allFields, FORM_DATA), null, 2)}</pre>
      </div>
    )
  }
}
