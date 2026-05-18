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
import { expect, userEvent, within } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import { FieldType, EventState, field } from '@opencrvs/commons/client'
import {
  FormFieldGenerator,
  FormFieldGeneratorPropsWithoutRef
} from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'

const meta: Meta<FormFieldGeneratorPropsWithoutRef> = {
  title: 'Inputs/Custom client methods',
  component: FormFieldGenerator,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    validatorContext: { control: false }
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

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 460px;
`

type Story = StoryObj<FormFieldGeneratorPropsWithoutRef>

/**
 * customClientValidator — cross-field sum check
 *
 * The "Total amount" field uses a custom validator to ensure its value
 * equals the sum of "Item A" and "Item B". This demonstrates that a
 * custom validator can reference other form fields via the context argument.
 */
export const CustomValidatorCrossFieldSum: Story = {
  name: 'customClientValidator — sum of two fields',
  render: function Component(args) {
    const [form, setForm] = React.useState<EventState>({
      itemA: 3,
      itemB: 7,
      itemSum: 10
    })
    const [touched, setTouched] = React.useState(args.formTouched)

    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'itemA',
            type: FieldType.NUMBER,
            required: true,
            label: {
              id: 'storybook.itemA.label',
              defaultMessage: 'Item A',
              description: ''
            }
          },
          {
            id: 'itemB',
            type: FieldType.NUMBER,
            required: true,
            label: {
              id: 'storybook.itemB.label',
              defaultMessage: 'Item B',
              description: ''
            }
          },
          {
            id: 'itemSum',
            type: FieldType.NUMBER,
            required: true,
            label: {
              id: 'storybook.itemSum.label',
              defaultMessage: 'Total amount (must equal Item A + Item B)',
              description: ''
            },
            validation: [
              {
                validator: field('itemSum').customClientValidator(
                  (value, ctx) => {
                    const { $form } = ctx as {
                      $form: Record<string, unknown>
                    }
                    return (
                      Number(value) ===
                      Number($form.itemA) + Number($form.itemB)
                    )
                  }
                ),
                message: {
                  id: 'storybook.itemSum.error',
                  defaultMessage: 'Total must equal Item A + Item B',
                  description: ''
                }
              }
            ]
          }
        ]}
        formTouched={touched}
        formValues={form}
        id="custom-validator-form"
        onFormChange={setForm}
        onTouchedChange={setTouched}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Correct sum — no error shown', async () => {
      const totalInput = await canvas.findByTestId('number__itemSum')
      await userEvent.click(totalInput)
      await userEvent.tab()
      await expect(
        canvas.queryByText('Total must equal Item A + Item B')
      ).toBeNull()
    })

    await step('Wrong sum — validation error appears', async () => {
      const totalInput = await canvas.findByTestId('number__itemSum')
      await userEvent.clear(totalInput)
      await userEvent.type(totalInput, '5')
      await userEvent.tab()
      await canvas.findByText('Total must equal Item A + Item B')
    })

    await step('Corrected sum — error disappears', async () => {
      const totalInput = await canvas.findByTestId('number__itemSum')
      await userEvent.clear(totalInput)
      await userEvent.type(totalInput, '10')
      await userEvent.tab()
      await expect(
        canvas.queryByText('Total must equal Item A + Item B')
      ).toBeNull()
    })
  }
}

/**
 * customClientEvaluation — auto-computed product
 *
 * The "Line total" field uses customClientEvaluation so its value is
 * automatically recomputed as quantity × unit price whenever either
 * source field changes. No manual entry is needed in the total field.
 */
export const CustomEvaluationComputedValue: Story = {
  name: 'customClientEvaluation — computed product',
  render: function Component(args) {
    const [form, setForm] = React.useState<EventState>({
      quantity: 2,
      unitPrice: 15,
      lineTotal: 30
    })
    const [touched, setTouched] = React.useState(args.formTouched)

    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'quantity',
            type: FieldType.NUMBER,
            required: true,
            label: {
              id: 'storybook.quantity.label',
              defaultMessage: 'Quantity',
              description: ''
            }
          },
          {
            id: 'unitPrice',
            type: FieldType.NUMBER,
            required: true,
            label: {
              id: 'storybook.unitPrice.label',
              defaultMessage: 'Unit price',
              description: ''
            }
          },
          {
            id: 'lineTotal',
            type: FieldType.NUMBER,
            required: false,
            label: {
              id: 'storybook.lineTotal.label',
              defaultMessage: 'Line total (auto-computed)',
              description: ''
            },
            // Recompute whenever quantity or unitPrice changes
            parent: [field('quantity'), field('unitPrice')],
            value: field('quantity').customClientEvaluation((qty, ctx) => {
              const { $form } = ctx as { $form: Record<string, unknown> }
              return Number(qty) * Number($form.unitPrice)
            })
          }
        ]}
        formTouched={touched}
        formValues={form}
        id="custom-evaluation-form"
        onFormChange={setForm}
        onTouchedChange={setTouched}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Line total is pre-computed from initial values (2 × 15 = 30)',
      async () => {
        const totalInput = (await canvas.findByTestId(
          'number__lineTotal'
        )) as HTMLInputElement
        await expect(totalInput.value).toBe('30')
      }
    )

    await step(
      'Changing quantity updates line total automatically',
      async () => {
        const quantityInput = await canvas.findByTestId('number__quantity')
        await userEvent.clear(quantityInput)
        await userEvent.type(quantityInput, '5')
        await userEvent.tab()

        const totalInput = (await canvas.findByTestId(
          'number__lineTotal'
        )) as HTMLInputElement
        await expect(totalInput.value).toBe('75')
      }
    )
  }
}
