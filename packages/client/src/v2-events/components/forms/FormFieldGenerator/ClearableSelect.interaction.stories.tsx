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
import { expect, fireEvent, within } from '@storybook/test'
import React from 'react'
import * as selectEvent from 'react-select-event'
import {
  FieldType,
  FieldConfig,
  EventState,
  generateTranslationConfig
} from '@opencrvs/commons/client'

import {
  FormFieldGenerator,
  FormFieldGeneratorPropsWithoutRef
} from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'

const meta: Meta<FormFieldGeneratorPropsWithoutRef> = {
  title: 'FormFieldGenerator/Interaction/ClearableSelect',
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

type Story = StoryObj<FormFieldGeneratorPropsWithoutRef>

const clearableSelectField = {
  id: 'tennis.surface',
  type: FieldType.SELECT,
  required: false,
  label: generateTranslationConfig('preferred surface'),
  options: [
    {
      label: generateTranslationConfig('clay'),
      value: 'clay'
    },
    {
      label: generateTranslationConfig('grass'),
      value: 'grass'
    }
  ]
} satisfies FieldConfig

export const ClearableSelect: Story = {
  name: 'Select value can be removed with the clear indicator',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    const [formValues, setFormValues] = React.useState<EventState>({
      'tennis.surface': 'clay'
    })

    return (
      <>
        <FormFieldGenerator
          {...args}
          fields={[clearableSelectField]}
          formValues={formValues}
          id="clearable-select-form"
          onFormChange={setFormValues}
        />
        <div data-testid="select-value-output">
          {JSON.stringify(formValues['tennis.surface'])}
        </div>
      </>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Renders the form with correct initial values', async () => {
      await canvas.findByText('preferred surface')
      await canvas.findByText('clay')
    })

    await step(
      'Clicking the clear indicator removes the selected value',
      async () => {
        const clearIndicator = canvasElement.querySelector(
          '.react-select__clear-indicator'
        )
        await expect(clearIndicator).not.toBeNull()
        // react-select handles clearing on mousedown rather than click
        await fireEvent.mouseDown(clearIndicator as Element)

        await expect(canvas.queryByText('clay')).not.toBeInTheDocument()

        // Cleared value is stored as null so it is explicitly removed
        // from a previously submitted declaration on submit
        await expect(
          await canvas.findByTestId('select-value-output')
        ).toHaveTextContent('null')
      }
    )

    await step('A new option can be selected after clearing', async () => {
      const select = await canvas.findByTestId('select__tennis____surface')
      await selectEvent.select(select, 'grass')

      await expect(
        await canvas.findByTestId('select-value-output')
      ).toHaveTextContent('"grass"')
    })
  }
}
