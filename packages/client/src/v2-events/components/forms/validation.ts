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
import { IValidationResult } from '@client/utils/validate'
import {
  ConditionalParameters,
  FieldConfig,
  validate
} from '@opencrvs/commons/client'
import { MessageDescriptor } from 'react-intl'
import { FlatFormData, getConditionalActionsForField } from './utils'

interface IFieldErrors {
  errors: IValidationResult[]
}

export type Errors = {
  [fieldName: string]: IFieldErrors
}

function isFieldHidden(field: FieldConfig, params: ConditionalParameters) {
  const hasShowRule = field.conditionals.some(
    (conditional) => conditional.type === 'SHOW'
  )
  const validConditionals = getConditionalActionsForField(field, params)
  const isVisible = !hasShowRule || validConditionals.includes('SHOW')
  return !isVisible
}

function isFieldDisabled(field: FieldConfig, params: ConditionalParameters) {
  const hasEnableRule = field.conditionals.some(
    (conditional) => conditional.type === 'ENABLE'
  )
  const validConditionals = getConditionalActionsForField(field, params)
  const isEnabled = !hasEnableRule || validConditionals.includes('ENABLE')
  return !isEnabled
}

function getValidationErrors(
  field: FieldConfig,
  values: FlatFormData,
  requiredErrorMessage?: MessageDescriptor,
  checkValidationErrorsOnly?: boolean
) {
  const conditionalParameters = {
    $form: values,
    $now: new Date().toISOString().split('T')[0]
  }

  if (
    isFieldHidden(field, conditionalParameters) ||
    isFieldDisabled(field, conditionalParameters)
  ) {
    return {
      errors: []
    }
  }

  const validators = field.validation ? field.validation : []

  // if (field.required && !checkValidationErrorsOnly) {
  //   validators.push(required(requiredErrorMessage))
  // } else if (isFieldButton(field)) {
  //   const { trigger } = field.options
  //   validators.push(httpErrorResponseValidator(trigger))
  // } else if (field.validateEmpty) {
  // } else if (!value && value !== 0) {
  //   validators = []
  // }

  const validationResults = validators
    .filter((validation) => {
      return !validate(validation.validator, {
        $form: values,
        $now: new Date().toISOString().split('T')[0]
      })
    })
    .map((validation) => ({ message: validation.message }))

  return {
    errors: validationResults
  }
}
export function getValidationErrorsForForm(
  fields: FieldConfig[],
  values: FlatFormData,
  requiredErrorMessage?: MessageDescriptor,
  checkValidationErrorsOnly?: boolean
) {
  return fields.reduce(
    (errorsForAllFields: Errors, field) =>
      errorsForAllFields[field.id] &&
      errorsForAllFields[field.id].errors.length > 0
        ? errorsForAllFields
        : {
            ...errorsForAllFields,
            [field.id]: getValidationErrors(
              field,
              values,
              requiredErrorMessage,
              checkValidationErrorsOnly
            )
          },
    {}
  )
}