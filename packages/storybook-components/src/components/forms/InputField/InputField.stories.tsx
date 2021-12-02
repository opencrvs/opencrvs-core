/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { Meta, Story } from '@storybook/react'
import { DateField, ValidIndicator, VerifyingIndicator } from '..'
import { ArrowWithGradient } from '../../icons'
import { Select } from '../Select'
import { TextInput } from '../TextInput'
import { InputField, IInputFieldProps } from './InputField'

export default {
  title: 'Components/forms/InputField',
  component: InputField
} as Meta

const Template: Story<IInputFieldProps> = args => (
  <InputField {...args}></InputField>
)

export const InputFieldWithText = Template.bind({})
InputFieldWithText.args = {
  id: 'default-input',
  label: 'Mobile number',
  children: <TextInput placeholder="e.g: +44-XXXX-XXXXXX" />
}

export const InputFieldWithSelect = Template.bind({})
InputFieldWithSelect.args = {
  required: false,
  id: 'select-input',
  label: 'Your favourite ice create flavour?',
  children: (
    <Select
      options={[
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
      ]}
      onChange={value => {
        alert(`${value}`)
      }}
      value={'Chocolate'}
    ></Select>
  )
}

export const InputFieldWithError = Template.bind({})
InputFieldWithError.args = {
  id: 'erro-on-input',
  label: 'Mobile number',
  touched: true,
  error: 'I think you made a mistake',
  children: (
    <TextInput
      touched
      error
      value="An input error"
      onChange={() => {}}
      placeholder="e.g: +44-XXXX-XXXXXX"
    />
  )
}

export const InputFieldDisabled = Template.bind({})
InputFieldDisabled.args = {
  id: 'disabled-input',
  label: 'A disabled field',
  disabled: true,
  children: <TextInput isDisabled={true} placeholder="e.g: +44-XXXX-XXXXXX" />
}

export const InputFieldWithPrefixPostfix = Template.bind({})
InputFieldWithPrefixPostfix.args = {
  id: 'optional-input',
  label: 'doller-weight',
  prefix: '$',
  postfix: 'kg',
  children: <TextInput />
}

export const InputFieldWithPostfixComp = Template.bind({})
InputFieldWithPostfixComp.args = {
  id: 'optional-input',
  label: 'Select a way forward',
  postfix: <ArrowWithGradient />,
  children: (
    <Select
      value=""
      onChange={value => {
        alert(`${value}`)
      }}
      options={[
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
      ]}
    />
  )
}

export const InputFieldWithVerifyIndicator = Template.bind({})
InputFieldWithVerifyIndicator.args = {
  id: 'Verify-indicator',
  label: 'Is Valid?',
  postfix: <VerifyingIndicator />,
  children: <TextInput />
}

export const InputFieldWithValidityIndicator = Template.bind({})
InputFieldWithValidityIndicator.args = {
  id: 'Validity-indicator',
  label: 'Is Valid?',
  postfix: <ValidIndicator />,
  children: <TextInput />
}

export const InputFieldWithDateField = Template.bind({})
InputFieldWithDateField.args = {
  id: 'input-date-field',
  label: 'Date of Birth',
  children: <DateField id="date" onChange={() => {}} />
}

export const InputFieldWithPredefinedDateField = Template.bind({})
InputFieldWithPredefinedDateField.args = {
  id: 'input-date-field',
  label: 'Date of Birth',
  children: (
    <DateField
      id="date"
      value="1980-04-21"
      onChange={dob => {
        alert(dob)
      }}
    />
  )
}
