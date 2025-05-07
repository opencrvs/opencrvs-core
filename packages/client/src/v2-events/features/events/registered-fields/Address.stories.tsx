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
import { fn } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import {
  EventConfig,
  FieldType,
  tennisClubMembershipEvent,
  AddressFieldValue,
  AddressType,
  getDeclaration
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { Review } from '@client/v2-events/features/events/components/Review'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { useFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'
import { TRPCProvider } from '@client/v2-events/trpc'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/Address',
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <React.Suspense>
        <TRPCProvider>
          <Story />
        </TRPCProvider>
      </React.Suspense>
    )
  ]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

export const EmptyAddressField: StoryObj<typeof FormFieldGenerator> = {
  name: 'Empty address input',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.address',
            type: FieldType.ADDRESS,
            label: {
              id: 'storybook.address.label',
              defaultMessage: 'Address',
              description: 'The title for the address input'
            }
          }
        ]}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}

export const AddressFieldWithUserPrimaryOfficeAddress: StoryObj<
  typeof FormFieldGenerator
> = {
  name: 'Defaults to user primary office address',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.address',
            type: 'ADDRESS',
            label: {
              id: 'storybook.address.label',
              defaultMessage: 'Address',
              description: 'The title for the address input'
            },
            defaultValue: {
              country: 'FAR',
              addressType: AddressType.DOMESTIC,
              province: '$user.province',
              district: '$user.district',
              urbanOrRural: 'URBAN'
            }
          }
        ]}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}

const eventConfig: EventConfig = tennisClubMembershipEvent

const declarationForm = getDeclaration(eventConfig)

export const AddressReviewUrban: StoryObj<typeof Review> = {
  name: 'Review output (Urban)',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <Review.Body
        form={{
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
            district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
            urbanOrRural: 'URBAN',
            town: 'Example Town',
            residentialArea: 'Example Residential Area',
            street: 'Example Street',
            number: '55',
            zipCode: '123456'
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
export const AddressReviewRural: StoryObj<typeof Review> = {
  name: 'Review output (Rural)',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <Review.Body
        form={{
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
            district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
            urbanOrRural: 'RURAL',
            village: 'Example Village'
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
export const AddressReviewInvalid: StoryObj<typeof Review> = {
  name: 'Review output (Invalid)',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <Review.Body
        form={{
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c'
          } as AddressFieldValue
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
export const AddressReviewEmpty: StoryObj<typeof Review> = {
  name: 'Review output (Empty)',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <Review.Body
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
export const AddressReviewChanged: StoryObj<typeof Review> = {
  name: 'Review with changed address',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <Review.Body
        form={{
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
            district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
            urbanOrRural: 'URBAN',
            town: 'Example Town',
            residentialArea: 'Example Residential Area',
            street: 'Example Street',
            number: '55',
            zipCode: '123456'
          }
        }}
        formConfig={declarationForm}
        previousFormValues={{
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
            district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
            urbanOrRural: 'RURAL',
            village: 'Example Village'
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
export const AddressInCopy: StoryObj<typeof Review> = {
  name: 'Address to string',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    const allFields = declarationForm.pages.map((page) => page.fields).flat()
    const stringifier = useFormDataStringifier()
    const flattenedIntl = useIntlFormatMessageWithFlattenedParams()
    const FORM_DATA = {
      'applicant.address': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
        district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
        urbanOrRural: 'URBAN' as const,
        town: 'Example Town',
        residentialArea: 'Example Residential Area',
        street: 'Example Street',
        number: '55',
        zipCode: '123456'
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
