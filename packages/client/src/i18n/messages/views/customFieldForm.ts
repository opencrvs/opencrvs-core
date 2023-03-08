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
  unitLabel: MessageDescriptor
  unitOptionEmpty: MessageDescriptor
  unitOptionG: MessageDescriptor
  unitOptionKg: MessageDescriptor
  unitOptionCm: MessageDescriptor
  unitOptionM: MessageDescriptor
  tooltipLabel: MessageDescriptor
  errorMessage: MessageDescriptor
  maxLengthLabel: MessageDescriptor
  duplicateField: MessageDescriptor
  copyHeading: MessageDescriptor
  copyDescription: MessageDescriptor
  dataSourceHeading: MessageDescriptor
  dataSourceDescription: MessageDescriptor
  validatingCSVFile: MessageDescriptor
  validatingCSVFilesValidatingDescription: MessageDescriptor
  statusValidating: MessageDescriptor
  statusValidated: MessageDescriptor
  statusFailed: MessageDescriptor
  statusAppliedToCustomSelect: MessageDescriptor
  statusNoDataFound: MessageDescriptor
  statusTranslationMissing: MessageDescriptor
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
  unitLabel: {
    id: 'custom.field.form.unit',
    defaultMessage: 'Unit',
    description: 'Heading of Custom FieldForm'
  },
  unitOptionEmpty: {
    id: 'custom.field.form.unitOptionEmpty',
    defaultMessage: 'None',
    description: 'Option of unit'
  },
  unitOptionG: {
    id: 'custom.field.form.unitOptionG',
    defaultMessage: 'Gram (G)',
    description: 'Option of unit'
  },
  unitOptionKg: {
    id: 'custom.field.form.unitOptionKg',
    defaultMessage: 'Kilogram (Kg)',
    description: 'Option of unit'
  },
  unitOptionCm: {
    id: 'custom.field.form.unitOptionCm',
    defaultMessage: 'Centimeter (Cm)',
    description: 'Option of unit'
  },
  unitOptionM: {
    id: 'custom.field.form.unitOptionM',
    defaultMessage: 'Meter (M)',
    description: 'Option of unit'
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
      'Label already exists in this form section. Please create a unique label',
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
  },
  validatingCSVFile: {
    id: 'custom.select.text.validatingCSVFile',
    defaultMessage: 'Validating CSV file'
  },
  validatingCSVFilesValidatingDescription: {
    id: 'custom.select.text.csvValidatingDescription',
    defaultMessage:
      'We are checking your .csv file for... this should take a few minutes... link to documentation'
  },
  statusValidating: {
    id: 'custom.select.text.statusValidating',
    defaultMessage: 'Validating .csv'
  },
  statusValidated: {
    id: 'custom.select.text.statusValidated',
    defaultMessage: 'Validated .csv'
  },
  statusFailed: {
    id: 'custom.select.text.statusFailed',
    defaultMessage: 'Failed to validate. Please try again'
  },
  statusAppliedToCustomSelect: {
    id: 'custom.select.text.statusAppliedToCustomSelect',
    defaultMessage: 'Applied to custom select'
  },
  statusNoDataFound: {
    id: 'custom.select.text.statusNoDataFound',
    defaultMessage: 'No option was found'
  },
  statusTranslationMissing: {
    id: 'custom.select.text.statusTranslationMissing',
    defaultMessage: 'Translation is missing'
  }
}

export const customFieldFormMessages: ICustomFieldFormMessages =
  defineMessages(messagesToDefine)
