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
import { httpErrorResponseValidator } from '@client/components/form/http'
import {
  IDynamicFormField,
  IFormField,
  IFormSectionData,
  RADIO_GROUP_WITH_NESTED_FIELDS
} from '@client/forms'
import { IValidationResult, required } from '@client/utils/validate'
import {
  getConditionalActionsForField,
  getFieldValidation,
  isFieldButton
} from './utils'
import { MessageDescriptor } from 'react-intl'

interface IFieldErrors {
  errors: IValidationResult[]
  nestedFields: {
    [fieldName: string]: IValidationResult[]
  }
}

export type Errors = {
  [fieldName: string]: IFieldErrors
}

const getValidationErrors = {
  forField: function (
    field: IFormField,
    values: IFormSectionData,
    requiredErrorMessage?: MessageDescriptor,
    checkValidationErrorsOnly?: boolean
  ) {
    const value =
      field.nestedFields && values[field.name]
        ? (values[field.name] as IFormSectionData).value
        : values[field.name]
    const conditionalActions = getConditionalActionsForField(field, {
      $form: values
    })
    if (
      conditionalActions.includes('hide') ||
      (conditionalActions.includes('disable') && !isFieldButton(field))
    ) {
      return {
        errors: [],
        nestedFields: {}
      }
    }

    let validators = field.validator ? Array.from(field.validator) : []

    validators.push(...getFieldValidation(field as IDynamicFormField, values))

    if (field.required && !checkValidationErrorsOnly) {
      validators.push(required(requiredErrorMessage))
    } else if (isFieldButton(field)) {
      const { trigger } = field.options
      validators.push(httpErrorResponseValidator(trigger))
    } else if (field.validateEmpty) {
    } else if (!value && value !== 0) {
      validators = []
    }

    const validationResults = validators
      .map((validator) => validator(value, { $form: values }))
      .filter((error) => error !== undefined) as IValidationResult[]

    return {
      errors: validationResults,
      nestedFields: this.forNestedField(field, values, requiredErrorMessage)
    }
  },
  forNestedField: function (
    field: IFormField,
    values: IFormSectionData,
    requiredErrorMessage?: MessageDescriptor
  ): {
    [fieldName: string]: IValidationResult[]
  } {
    if (field.type === RADIO_GROUP_WITH_NESTED_FIELDS) {
      const parentValue =
        values[field.name] && (values[field.name] as IFormSectionData).value
      const nestedFieldDefinitions =
        (parentValue && field.nestedFields[parentValue as string]) || []
      return nestedFieldDefinitions.reduce((nestedErrors, nestedField) => {
        const errors = this.forField(
          nestedField,
          (values[field.name] as IFormSectionData)
            .nestedFields as IFormSectionData
        ).errors

        return {
          ...nestedErrors,
          [nestedField.name]: errors
        }
      }, {})
    }

    return {}
  }
}
export function getValidationErrorsForForm(
  fields: IFormField[],
  values: IFormSectionData,
  requiredErrorMessage?: MessageDescriptor,
  checkValidationErrorsOnly?: boolean
) {
  return fields.reduce(
    (errorsForAllFields: Errors, field) =>
      errorsForAllFields[field.name] &&
      errorsForAllFields[field.name].errors.length > 0
        ? errorsForAllFields
        : {
            ...errorsForAllFields,
            [field.name]: getValidationErrors.forField(
              field,
              values,
              requiredErrorMessage,
              checkValidationErrorsOnly
            )
          },
    {}
  )
}