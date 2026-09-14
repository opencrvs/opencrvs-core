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

import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import styled from 'styled-components'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { and, field, FieldType, NameField } from '@opencrvs/commons/client'
import {
  FormFieldGenerator,
  FormFieldGeneratorHandle,
  FormFieldGeneratorPropsWithoutRef
} from '@client/v2-events/components/forms/FormFieldGenerator'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'

const NAME_FIELD_ID = 'storybook.name'

const INVALID_NAME_MESSAGE = 'Input contains invalid characters.'

/**
 * The validator shape country configs use for name fields, e.g.
 * `invalidNameValidator` in `packages/testland/src/events/birth/validators.ts`.
 * `and(...)` produces an `allOf` schema with no top-level `properties`, which
 * used to make `getValidatorsForField` drop the rule for every subfield.
 */
const nameField = {
  id: NAME_FIELD_ID,
  type: FieldType.NAME,
  /*
   * Required on the composite itself, as country configs declare it (e.g.
   * `collector.OTHER.name`). Without it `isFieldEmptyAndNotRequired` skips the
   * composite's own structural validation and it never reports "Required".
   */
  required: true,
  label: {
    id: 'storybook.name.label',
    defaultMessage: 'Name',
    description: 'The title for the name input'
  },
  configuration: {
    name: {
      firstname: { required: true },
      middlename: { required: false },
      surname: { required: true }
    }
  },
  validation: [
    {
      validator: and(
        field(NAME_FIELD_ID).get('firstname').isValidEnglishName(),
        field(NAME_FIELD_ID).get('middlename').isValidEnglishName(),
        field(NAME_FIELD_ID).get('surname').isValidEnglishName()
      ),
      message: {
        defaultMessage: INVALID_NAME_MESSAGE,
        description: 'This is the error message for an invalid name',
        id: 'storybook.error.invalidName'
      }
    }
  ]
} satisfies NameField

/**
 * The same field with `showParentFieldError` turned on. The flag gates two
 * things — the subfield `validation` in `Name.tsx` and the parent error in
 * `GeneratedInputField.tsx` — but NOT the subfield `required`, which always
 * comes from `configuration.name.<subfield>.required`. The stories below pin
 * down what that asymmetry looks like on screen.
 */
const nameFieldWithParentError = {
  ...nameField,
  configuration: { ...nameField.configuration, showParentFieldError: true }
} satisfies NameField

/** The id `InputField` gives the composite field's error element. */
const PARENT_ERROR_SELECTOR = `#${makeFormFieldIdFormikCompatible(
  NAME_FIELD_ID
)}_error`

const REQUIRED_MESSAGE = 'Required'

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

const meta: Meta<FormFieldGeneratorPropsWithoutRef> = {
  title: 'Inputs/Name/Interaction',
  component: FormFieldGenerator,
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  argTypes: {
    validatorContext: { control: false }
  },
  args: {
    id: 'name-form',
    fields: [nameField]
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

type Story = StoryObj<FormFieldGeneratorPropsWithoutRef>

function StatefulNameForm(args: FormFieldGeneratorPropsWithoutRef) {
  const [form, setForm] = React.useState(args.formValues)
  const [touched, setTouched] = React.useState(args.formTouched)

  return (
    <StyledFormFieldGenerator
      {...args}
      formTouched={touched}
      formValues={form}
      id="name-form"
      onFormChange={setForm}
      onTouchedChange={setTouched}
    />
  )
}

export const InvalidNameShowsInlineErrorOnEverySubfield: Story = {
  name: 'and() validator shows an inline error on every invalid subfield',
  render: StatefulNameForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstname = await canvas.findByTestId('text__firstname')
    await userEvent.type(firstname, 'Ann@')
    await userEvent.tab()

    // Optional, and still validated once it holds a value.
    const middlename = await canvas.findByTestId('text__middlename')
    await userEvent.type(middlename, 'Lee%')
    await userEvent.tab()

    const surname = await canvas.findByTestId('text__surname')
    await userEvent.type(surname, 'Smith#')
    await userEvent.tab()

    await expect(
      (await canvas.findAllByText(INVALID_NAME_MESSAGE)).length
    ).toBeGreaterThan(0)

    // Every part is invalid, so every input says so — the user does not have to
    // fix one, resubmit, and discover the next.
    await waitFor(async () =>
      expect(canvas.getAllByText(INVALID_NAME_MESSAGE)).toHaveLength(3)
    )
    await expect(
      canvasElement.querySelector('#firstname_error')
    ).toHaveTextContent(INVALID_NAME_MESSAGE)
    await expect(
      canvasElement.querySelector('#middlename_error')
    ).toHaveTextContent(INVALID_NAME_MESSAGE)
    await expect(
      canvasElement.querySelector('#surname_error')
    ).toHaveTextContent(INVALID_NAME_MESSAGE)
  }
}

export const ValidFirstnameShowsNoError: Story = {
  name: 'and() validator stays quiet for a valid name',
  render: StatefulNameForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstname = await canvas.findByTestId('text__firstname')
    await userEvent.type(firstname, 'Ann')
    await userEvent.tab()

    const surname = await canvas.findByTestId('text__surname')
    await userEvent.type(surname, 'Smith')
    await userEvent.tab()

    await waitFor(async () =>
      expect(canvas.queryByText(INVALID_NAME_MESSAGE)).toBe(null)
    )
  }
}

export const ErrorRendersOnlyOnTheInvalidSubfield: Story = {
  name: 'and() validator flags only the invalid subfield',
  render: StatefulNameForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstname = await canvas.findByTestId('text__firstname')
    await userEvent.type(firstname, 'Ann')
    await userEvent.tab()

    const surname = await canvas.findByTestId('text__surname')
    await userEvent.type(surname, 'Smith@')
    await userEvent.tab()

    const error = await canvas.findByText(INVALID_NAME_MESSAGE)
    await expect(error).toBeInTheDocument()

    // Exactly one subfield reports the error, and it is the surname
    await expect(canvas.getAllByText(INVALID_NAME_MESSAGE)).toHaveLength(1)
    await expect(
      canvasElement.querySelector('#surname_error')
    ).toHaveTextContent(INVALID_NAME_MESSAGE)
    await expect(canvasElement.querySelector('#firstname_error')).toBe(null)
  }
}

/**
 * Same form plus a Continue button, mirroring `Pages.tsx`: continuing calls
 * `submit()`, which marks every field on the page touched — including the
 * composite itself. Blurring a subfield only touches the subfield, so the
 * composite's own error stays hidden until Continue is pressed.
 */
function SubmittableNameForm(args: FormFieldGeneratorPropsWithoutRef) {
  const [form, setForm] = React.useState(args.formValues)
  const [touched, setTouched] = React.useState(args.formTouched)
  const formRef = React.useRef<FormFieldGeneratorHandle>(null)

  return (
    <>
      <StyledFormFieldGenerator
        {...args}
        ref={formRef}
        formTouched={touched}
        formValues={form}
        id="name-form"
        onFormChange={setForm}
        onTouchedChange={setTouched}
      />
      <button type="button" onClick={() => formRef.current?.submit()}>
        {'Continue'}
      </button>
    </>
  )
}

export const ParentFieldErrorFlagMovesErrorToComposite: Story = {
  name: 'showParentFieldError moves the error off the subfield',
  args: { fields: [nameFieldWithParentError] },
  render: StatefulNameForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstname = await canvas.findByTestId('text__firstname')
    await userEvent.type(firstname, 'Ann@')
    await userEvent.tab()

    /*
     * The surname has to be filled in too. The composite only ever renders its
     * first error, and an empty required subfield makes the parent's own
     * structural "Required" win over the custom message.
     */
    const surname = await canvas.findByTestId('text__surname')
    await userEvent.type(surname, 'Smith')
    await userEvent.tab()

    await expect(
      await canvas.findByText(INVALID_NAME_MESSAGE)
    ).toBeInTheDocument()

    // The message renders once, on the composite field rather than the input
    // that actually holds the invalid value.
    await expect(canvas.getAllByText(INVALID_NAME_MESSAGE)).toHaveLength(1)
    await expect(
      canvasElement.querySelector(PARENT_ERROR_SELECTOR)
    ).toHaveTextContent(INVALID_NAME_MESSAGE)
    await expect(canvasElement.querySelector('#firstname_error')).toBe(null)
  }
}

export const ParentFieldErrorFlagCollapsesTwoInvalidSubfields: Story = {
  name: 'showParentFieldError reports two invalid subfields as one message',
  args: { fields: [nameFieldWithParentError] },
  render: StatefulNameForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstname = await canvas.findByTestId('text__firstname')
    await userEvent.type(firstname, 'Ann@')
    await userEvent.tab()

    const surname = await canvas.findByTestId('text__surname')
    await userEvent.type(surname, 'Smith#')
    await userEvent.tab()

    await expect(
      await canvas.findByText(INVALID_NAME_MESSAGE)
    ).toBeInTheDocument()

    // Both subfields are invalid, but the composite can only say so once, so
    // the user cannot tell which input still needs fixing.
    await expect(canvas.getAllByText(INVALID_NAME_MESSAGE)).toHaveLength(1)
    await expect(canvasElement.querySelector('#firstname_error')).toBe(null)
    await expect(canvasElement.querySelector('#surname_error')).toBe(null)
  }
}

export const ParentFieldErrorFlagDuplicatesRequired: Story = {
  name: 'showParentFieldError does not gate the subfield required error',
  args: { fields: [nameFieldWithParentError] },
  render: SubmittableNameForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Continue on an untouched, empty form — the reported repro.
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Continue' })
    )

    await expect(
      (await canvas.findAllByText(REQUIRED_MESSAGE)).length
    ).toBeGreaterThan(0)

    /*
     * `required` lives on the subfields and is never gated by the flag, while
     * the composite reports its own structural error, so the same word appears
     * three times: once per input plus once for the whole name.
     */
    await waitFor(async () =>
      expect(canvas.getAllByText(REQUIRED_MESSAGE)).toHaveLength(3)
    )
    await expect(
      canvasElement.querySelector(PARENT_ERROR_SELECTOR)
    ).toHaveTextContent(REQUIRED_MESSAGE)
    await expect(
      canvasElement.querySelector('#firstname_error')
    ).toHaveTextContent(REQUIRED_MESSAGE)
    await expect(
      canvasElement.querySelector('#surname_error')
    ).toHaveTextContent(REQUIRED_MESSAGE)
  }
}

export const RequiredRendersOncePerInputWithoutTheFlag: Story = {
  name: 'without the flag, required renders once per input',
  render: SubmittableNameForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Continue' })
    )

    await expect(
      (await canvas.findAllByText(REQUIRED_MESSAGE)).length
    ).toBeGreaterThan(0)

    // Two inputs, two messages — the composite stays silent.
    await waitFor(async () =>
      expect(canvas.getAllByText(REQUIRED_MESSAGE)).toHaveLength(2)
    )
    await expect(canvasElement.querySelector(PARENT_ERROR_SELECTOR)).toBe(null)
  }
}
