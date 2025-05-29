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

import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { ConditionalParameters, JSONSchema } from './conditionals'

import { formatISO } from 'date-fns'
import { ErrorMapCtx, ZodIssueOptionalMessage } from 'zod'
import { EventState, ActionUpdate } from '../events/ActionDocument'
import { FieldConfig } from '../events/FieldConfig'
import { mapFieldTypeToZod } from '../events/FieldTypeMapping'
import { FieldUpdateValue } from '../events/FieldValue'
import { TranslationConfig } from '../events/TranslationConfig'
import { ConditionalType, FieldConditional } from '../events/Conditional'

const ajv = new Ajv({
  $data: true,
  allowUnionTypes: true
})

// https://ajv.js.org/packages/ajv-formats.html
addFormats(ajv)
export function validate(schema: JSONSchema, data: ConditionalParameters) {
  return ajv.validate(schema, data)
}

export function isConditionMet(
  conditional: JSONSchema,
  values: Record<string, unknown>
) {
  return validate(conditional, {
    $form: values,
    $now: formatISO(new Date(), { representation: 'date' })
  })
}

function getConditionalActionsForField(
  field: FieldConfig,
  values: ConditionalParameters
) {
  if (!field.conditionals) {
    return []
  }
  return field.conditionals
    .filter((conditional) => validate(conditional.conditional, values))
    .map((conditional) => conditional.type)
}

export function areConditionsMet(
  conditions: FieldConditional[],
  values: Record<string, unknown>
) {
  return conditions.every((condition) =>
    isConditionMet(condition.conditional, values)
  )
}

function isFieldConditionMet(
  field: FieldConfig,
  form: ActionUpdate | EventState,
  conditionalType: ConditionalType
) {
  const hasRule = (field.conditionals ?? []).some(
    (conditional) => conditional.type === conditionalType
  )

  if (!hasRule) {
    return true
  }

  const validConditionals = getConditionalActionsForField(field, {
    $form: form,
    $now: formatISO(new Date(), {
      representation: 'date'
    })
  })

  return validConditionals.includes(conditionalType)
}

export function isFieldVisible(
  field: FieldConfig,
  form: ActionUpdate | EventState
) {
  return isFieldConditionMet(field, form, ConditionalType.SHOW)
}

function isFieldEmptyAndNotRequired(field: FieldConfig, form: ActionUpdate) {
  const fieldValue = form[field.id]
  return !field.required && (fieldValue === undefined || fieldValue === '')
}

export function isFieldEnabled(
  field: FieldConfig,
  form: ActionUpdate | EventState
) {
  return isFieldConditionMet(field, form, ConditionalType.ENABLE)
}

// Fields are displayed on review if both the 'ConditionalType.SHOW' and 'ConditionalType.DISPLAY_ON_REVIEW' conditions are met
export function isFieldDisplayedOnReview(
  field: FieldConfig,
  form: ActionUpdate | EventState
) {
  return (
    isFieldVisible(field, form) &&
    isFieldConditionMet(field, form, ConditionalType.DISPLAY_ON_REVIEW)
  )
}

export const errorMessages = {
  hiddenField: {
    id: 'v2.error.hidden',
    defaultMessage: 'Hidden or disabled field should not receive a value',
    description:
      'Error message when field is hidden or disabled, but a value was received'
  },
  invalidDate: {
    defaultMessage: 'Invalid date field',
    description: 'Error message when date field is invalid',
    id: 'v2.error.invalidDate'
  },
  invalidEmail: {
    defaultMessage: 'Invalid email address',
    description: 'Error message when email address is invalid',
    id: 'v2.error.invalidEmail'
  },
  requiredField: {
    defaultMessage: 'Required for registration',
    description: 'Error message when required field is missing',
    id: 'v2.error.required'
  },
  invalidInput: {
    defaultMessage: 'Invalid input',
    description: 'Error message when generic field is invalid',
    id: 'v2.error.invalid'
  }
}

function createIntlError(message: TranslationConfig) {
  return {
    message: {
      message
    }
  }
}

/**
 * Form error message definitions for Zod validation errors.
 * Overrides zod internal type error messages (string) to match the OpenCRVS error messages (TranslationConfig).
 */
function zodToIntlErrorMap(issue: ZodIssueOptionalMessage, _ctx: ErrorMapCtx) {
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (issue.code) {
    case 'invalid_string': {
      if (_ctx.data === '') {
        return createIntlError(errorMessages.requiredField)
      }

      if (issue.validation === 'date') {
        return createIntlError(errorMessages.invalidDate)
      }

      if (issue.validation === 'email') {
        return createIntlError(errorMessages.invalidEmail)
      }

      break
    }

    case 'invalid_type': {
      if (issue.expected !== issue.received && issue.received === 'undefined') {
        return createIntlError(errorMessages.requiredField)
      }

      break
    }
    case 'too_small': {
      if (issue.message === undefined) {
        return createIntlError(errorMessages.requiredField)
      }

      break
    }
    case 'invalid_union': {
      for (const { issues } of issue.unionErrors) {
        for (const e of issues) {
          if (
            zodToIntlErrorMap(e, _ctx).message.message.id !==
            'v2.error.required'
          ) {
            return createIntlError(errorMessages.invalidInput)
          }
        }
      }
      return createIntlError(errorMessages.requiredField)
    }
  }

  return createIntlError(errorMessages.invalidInput)
}

/**
 * Custom error map for Zod to override the default error messages in intl-formik format.
 */
export type CustomZodToIntlErrorMap = {
  /** Zod by default expects { message: string } */
  message: {
    /** Override it to match current intl-formik model */
    message: TranslationConfig
  }
}

/**
 * Each field can have custom validations defined in the field configuration.
 * It is separate from standard field type validations. e.g. "is this a valid date" vs "is this date in the future"
 * @see validateFieldInput
 * @returns list of error messages for the field
 *
 */
function runCustomFieldValidations({
  field,
  conditionalParameters
}: {
  field: FieldConfig
  conditionalParameters: ConditionalParameters
}) {
  return (field.validation ?? [])
    .filter((validation) => {
      return !validate(validation.validator, conditionalParameters)
    })
    .map((validation) => ({ message: validation.message }))
}

/**
 * Validates primitive fields defined by the FieldConfig type.
 * e.g. email is proper format, date is a valid date, etc.
 * for custom validations @see runCustomFieldValidations
 */
export function validateFieldInput({
  field,
  value
}: {
  field: FieldConfig
  value: FieldUpdateValue
}) {
  const rawError = mapFieldTypeToZod(field.type, field.required).safeParse(
    value,
    {
      // @ts-expect-error
      errorMap: zodToIntlErrorMap
    }
  )

  // We have overridden the standard error messages
  return (rawError.error?.issues.map((issue) => issue.message) ??
    []) as unknown as {
    message: TranslationConfig
  }[]
}

export function runFieldValidations({
  field,
  values
}: {
  field: FieldConfig
  values: ActionUpdate
}) {
  if (
    !isFieldVisible(field, values) ||
    isFieldEmptyAndNotRequired(field, values)
  ) {
    return {
      errors: []
    }
  }

  const conditionalParameters = {
    $form: values,
    $now: formatISO(new Date(), { representation: 'date' })
  }

  const fieldValidationResult = validateFieldInput({
    field,
    value: values[field.id]
  })

  const customValidationResults = runCustomFieldValidations({
    field,
    conditionalParameters
  })

  return {
    // Assumes that custom validation errors are based on the field type, and extend the validation.
    errors: [...fieldValidationResult, ...customValidationResults]
  }
}

export function getValidatorsForField(
  fieldId: FieldConfig['id'],
  validations: NonNullable<FieldConfig['validation']>
): NonNullable<FieldConfig['validation']> {
  return validations
    .map(({ validator, message }) => {
      const jsonSchema = validator as any

      const $form = jsonSchema.properties.$form

      /*
       * If you are working with nested "composite fields" like address or name,
       * It is useful to change the validation to only include the specific fields without the parent layer
       * for the full form field so
       *
       * {'some.field.id': {'properties': {a: Validator, b: Validator}}} will be transformed to
       * {a: Validator, b: Validator}
       */
      if ($form.properties?.[fieldId]?.type === 'object') {
        return {
          message,
          validator: {
            ...jsonSchema,
            properties: {
              $form: {
                type: 'object',
                properties: $form.properties?.[fieldId]?.properties || {},
                required: $form.properties?.[fieldId]?.required || []
              }
            }
          }
        }
      }

      if (!$form.properties?.[fieldId]) {
        return null
      }

      return {
        message,
        validator: {
          ...jsonSchema,
          properties: {
            $form: {
              type: 'object',
              properties: {
                [fieldId]: $form.properties?.[fieldId]
              },
              required: $form.required?.includes(fieldId) ? [fieldId] : []
            }
          }
        }
      }
    })
    .filter((x) => x !== null) as NonNullable<FieldConfig['validation']>
}
