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
  customTextFieldHeading: MessageDescriptor
  customTextAreaHeading: MessageDescriptor
  customNumberFieldHeading: MessageDescriptor
  customPhoneFieldHeading: MessageDescriptor
  customSelectFieldHeading: MessageDescriptor
  hideFieldLabel: MessageDescriptor
  requiredFieldLabel: MessageDescriptor
  conditionalFieldHeaderLabel: MessageDescriptor
  conditionalFieldLabel: MessageDescriptor
  conditionalFieldDesc: MessageDescriptor
  conditionalRegexField: MessageDescriptor
  label: MessageDescriptor
  placeholderLabel: MessageDescriptor
  descriptionLabel: MessageDescriptor
  tooltipLabel: MessageDescriptor
  errorMessage: MessageDescriptor
  maxLengthLabel: MessageDescriptor
  duplicateField: MessageDescriptor
  copyHeading: MessageDescriptor
  copyDescription: MessageDescriptor
  dataSourceHeading: MessageDescriptor
  dataSourceDescription: MessageDescriptor
}

const messagesToDefine: ICustomFieldFormMessages = {
  handleBardHeading: {
    id: 'custom.field.form.heading',
    defaultMessage: 'Certificate handlebars',
    description: 'Heading of Custom FieldForm'
  },
  customTextFieldHeading: {
    id: 'custom.field.text.heading',
    defaultMessage: 'Custom text input',
    description: 'Heading of Custom FieldForm'
  },
  customTextAreaHeading: {
    id: 'custom.field.textarea.heading',
    defaultMessage: 'Custom textarea',
    description: 'Heading of Custom FieldForm'
  },
  customNumberFieldHeading: {
    id: 'custom.field.number.heading',
    defaultMessage: 'Custom number input',
    description: 'Heading of Custom FieldForm'
  },
  customPhoneFieldHeading: {
    id: 'custom.field.phone.heading',
    defaultMessage: 'Custom phone number',
    description: 'Heading of Custom FieldForm'
  },
  customSelectFieldHeading: {
    id: 'custom.field.select.heading',
    defaultMessage: 'Custom select',
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
  conditionalFieldHeaderLabel: {
    id: 'custom.field.form.conditionalFieldHeader',
    defaultMessage: 'Conditional parameters',
    description: 'Heading of Custom FieldForm'
  },
  conditionalFieldLabel: {
    id: 'custom.field.form.conditionalField',
    defaultMessage: 'Conditional field',
    description: 'Heading of Custom FieldForm'
  },
  conditionalFieldDesc: {
    id: 'custom.field.form.conditionalFieldDesc',
    defaultMessage:
      'Select the field and the conditions on which this field should show',
    description: 'Description of Conditonal Custom FieldForm'
  },
  conditionalRegexField: {
    id: 'custom.field.form.conditionalRegex',
    defaultMessage: 'Value RegEx',
    description: 'Description of Conditonal Regex FieldForm'
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
  },
  copyHeading: {
    id: 'custom.select.copy.heading',
    defaultMessage: 'Copy',
    description: 'Heading for custom field heading'
  },
  copyDescription: {
    id: 'custom.select.copy.description',
    defaultMessage:
      'Complete the copy requirements for all available languages',
    description: 'Description for custom select field'
  },
  dataSourceHeading: {
    id: 'custom.select.dataSource.heading',
    defaultMessage: 'Data source',
    description: 'Heading for data source in Custom Select field'
  },
  dataSourceDescription: {
    id: 'custom.select.dataSource.description',
    defaultMessage:
      'Use an existing data source or upload a csv file containing the select options for each language.',
    description: 'Description for Data source'
  }
}

export const customFieldFormMessages: ICustomFieldFormMessages =
  defineMessages(messagesToDefine)
