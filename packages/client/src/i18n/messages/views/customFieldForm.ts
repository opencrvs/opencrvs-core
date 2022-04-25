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
import { defineMessages, MessageDescriptor } from 'react-intl'

interface ICustomFieldFormMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  handleBardHeading: MessageDescriptor
  customFieldFormHeading: MessageDescriptor
  hideFieldLabel: MessageDescriptor
  requiredFieldLabel: MessageDescriptor
  label: MessageDescriptor
  placeholderLabel: MessageDescriptor
  descriptionLabel: MessageDescriptor
  tooltipLabel: MessageDescriptor
  errorMessage: MessageDescriptor
  maxLengthLabel: MessageDescriptor
  duplicateField: MessageDescriptor
}

const messagesToDefine: ICustomFieldFormMessages = {
  handleBardHeading: {
    id: 'custom.field.form.heading',
    defaultMessage: 'Certificate handlebars',
    description: 'Heading of Custom FieldForm'
  },
  customFieldFormHeading: {
    id: 'custom.field.form.heading',
    defaultMessage: 'Custom text input',
    description: 'Heading of Custom FieldForm'
  },
  hideFieldLabel: {
    id: 'custom.field.form.hideField',
    defaultMessage: 'Hide field',
    description: 'Heading of Custom FieldForm'
  },
  requiredFieldLabel: {
    id: 'custom.field.form.requiredField',
    defaultMessage: 'Required for registration',
    description: 'Heading of Custom FieldForm'
  },
  label: {
    id: 'custom.field.form.label',
    defaultMessage: 'Label',
    description: 'Heading of Custom FieldForm'
  },
  placeholderLabel: {
    id: 'custom.field.form.placeholder',
    defaultMessage: 'Placeholder',
    description: 'Heading of Custom FieldForm'
  },
  descriptionLabel: {
    id: 'custom.field.form.description',
    defaultMessage: 'Description',
    description: 'Heading of Custom FieldForm'
  },
  tooltipLabel: {
    id: 'custom.field.form.tooltip',
    defaultMessage: 'Tooltip',
    description: 'Heading of Custom FieldForm'
  },
  errorMessage: {
    id: 'custom.field.form.errorMessage',
    defaultMessage: 'Error message',
    description: 'Heading of Custom FieldForm'
  },
  maxLengthLabel: {
    id: 'custom.field.form.maxLength',
    defaultMessage: 'Max length',
    description: 'Heading of Custom FieldForm'
  },
  duplicateField: {
    id: 'custom.field.form.duplicateField',
    defaultMessage:
      'Sorry that certificate handlebar already exists. Please change the English label.',
    description: 'Duplicate field error message'
  }
}

export const customFieldFormMessages: ICustomFieldFormMessages =
  defineMessages(messagesToDefine)
