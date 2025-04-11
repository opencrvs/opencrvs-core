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
import { expect, fn, within } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import {
  FieldType,
  TENNIS_CLUB_DECLARATION_FORM
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { Review } from '@client/v2-events/features/events/components/Review'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/Checkbox',
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

export const CheckboxInput: StoryObj<typeof FormFieldGenerator> = {
  name: 'Checkbox input',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState({})
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.checkbox',
            type: FieldType.CHECKBOX,
            label: {
              id: 'storybook.checkbox.label',
              defaultMessage: 'Is my question true?',
              description: 'The title for the checkbox input'
            }
          }
        ]}
        formData={formData}
        id="my-form"
        setAllFieldsDirty={false}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  }
}

export const CheckedCheckboxShouldAppearOnReview: StoryObj<typeof Review> = {
  parameters: {
    layout: 'center'
  },
  render: function Component() {
    return (
      <div>
        <Review.Body
          form={{ 'recommender.none': true }}
          formConfig={TENNIS_CLUB_DECLARATION_FORM}
          title="Checkbox review"
          // eslint-disable-next-line no-console
          onEdit={(values) => console.log(values)}
        >
          <div />
        </Review.Body>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText(/Checkbox review?/)

    await expect(canvas.queryByText('No recommender')).toBeInTheDocument()
    await expect(
      canvas.queryByTestId('row-value-recommender.none')
    ).toHaveTextContent('Yes')
  }
}

export const UncheckedCheckboxShouldNotAppearOnReview: StoryObj<typeof Review> =
  {
    parameters: {
      layout: 'center'
    },
    render: function Component() {
      return (
        <div>
          <Review.Body
            form={{}}
            formConfig={TENNIS_CLUB_DECLARATION_FORM}
            title="Checkbox review"
            // eslint-disable-next-line no-console
            onEdit={(values) => console.log(values)}
          >
            <div />
          </Review.Body>
        </div>
      )
    },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)

      await canvas.findByText(/Checkbox review?/)

      await expect(
        canvas.queryByTestId('No recommender')
      ).not.toBeInTheDocument()
    }
  }
