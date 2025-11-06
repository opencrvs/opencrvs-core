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

import Ajv from 'ajv/dist/2019'
import addFormats from 'ajv-formats'
import * as z from 'zod/v4'
import { $ZodIssue } from 'zod/v4/core'
import { formatISO, isAfter, isBefore } from 'date-fns'

import { ConditionalParameters, JSONSchema } from './conditionals'
import { ActionUpdate, EventState } from '../events/ActionDocument'
import { ConditionalType, FieldConditional } from '../events/Conditional'
import { FieldConfig } from '../events/FieldConfig'
import { mapFieldTypeToZod } from '../events/FieldTypeMapping'
import {
  DateValue,
  FieldUpdateValue,
  FieldValue,
  AgeValue
} from '../events/FieldValue'
import { TranslationConfig } from '../events/TranslationConfig'
import { ITokenPayload } from '../authentication'
import { UUID } from '../uuid'
import { ageToDate } from '../events/utils'

const ajv = new Ajv({
  $data: true,
  allowUnionTypes: true,
  strict: false // Allow minContains and other newer features
})

const DataContext = z.object({
  rootData: z.object({
    $leafAdminStructureLocationIds: z.array(z.object({ id: UUID }))
  })
})

type DataContext = z.infer<typeof DataContext>

// https://ajv.js.org/packages/ajv-formats.html
addFormats(ajv)

/*
 * Custom keyword validator for date strings so the dates could be validated dynamically
 * For example, a validation could be "birth date needs to have happend 30 days before today"
 * or "death date needs to be after birth date + 30 days"
 *
 * Example schema:
 * {
 *   "type": "object",
 *   "properties": {
 *     "birthDate": {
 *       "type": "string",
 *       "daysFromNow": {
 *         "days": 30,
 *         "clause": "before"
 *       }
 *    }
 * }
 */
ajv.addKeyword({
  keyword: 'daysFromNow',
  type: 'string',
  schemaType: 'object',
  $data: true,
  errors: true,
  validate(
    schema: { days: number; clause: 'after' | 'before' },
    data: string,
    _: unknown,
    dataContext?: { rootData: unknown }
  ) {
    if (
      !(
        dataContext &&
        dataContext.rootData &&
        typeof dataContext.rootData === 'object' &&
        '$now' in dataContext.rootData &&
        typeof dataContext.rootData.$now === 'string'
      )
    ) {
      throw new Error('Validation context must contain $now')
    }

    const { days, clause } = schema
    if (typeof data !== 'string') {
      return false
    }

    const date = new Date(data)
    if (isNaN(date.getTime())) {
      return false
    }

    const now = new Date(dataContext.rootData.$now)
    const offsetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return clause === 'after'
      ? isAfter(date, offsetDate)
      : isBefore(date, offsetDate)
  }
})

ajv.addKeyword({
  keyword: 'isLeafLevelLocation',
  type: 'string',
  schemaType: 'boolean',
  $data: true,
  errors: true,
  // @ts-ignore -- Force type. We will move this away from AJV next. Parsing the array will take seconds and is only called by core.
  validate(schema: {}, data: string, _: unknown, dataContext?: DataContext) {
    const locationIdInput = data
    const locations = dataContext?.rootData.$leafAdminStructureLocationIds ?? []

    return locations.some((location) => location.id === locationIdInput)
  }
})

export function validate(schema: JSONSchema, data: ConditionalParameters) {
  const validator = ajv.getSchema(schema.$id) || ajv.compile(schema)
  if ('$form' in data) {
    data.$form = Object.fromEntries(
      Object.entries(data.$form).map(([key, value]) => {
        const maybeAgeValue = AgeValue.safeParse(value)
        if (maybeAgeValue.success) {
          const age = maybeAgeValue.data.age
          const maybeAsOfDate = DateValue.safeParse(
            data.$form[maybeAgeValue.data.asOfDateRef]
          )

          return [
            key,
            {
              age,
              dob: ageToDate(
                age,
                maybeAsOfDate.success ? maybeAsOfDate.data : data.$now
              )
            }
          ]
        }
        return [key, value]
      })
    )
  }
  const result = validator(data) as boolean
  return result
}

/*
 * This is for validating arbitrary JSON data against a JSON schema outside of the context of a form.
 * It is used for instance when an input component wants to validate something internally as per user
 * configured rules (e.g. Search field).
 */
export function validateValue(schema: JSONSchema, data: unknown) {
  const validator = ajv.getSchema(schema.$id) || ajv.compile(schema)
  const result = validator(data) as boolean
  return result
}

export function isOnline() {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    return navigator.onLine
  }
  // Server-side: assume always online
  return true
}

export function isConditionMet(
  conditional: JSONSchema,
  values: Record<string, FieldUpdateValue>,
  context: ValidatorContext
) {
  return validate(conditional, {
    $form: values,
    $now: formatISO(new Date(), { representation: 'date' }),
    $online: isOnline(),
    $user: context.user
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
  values: Record<string, FieldValue>,
  context: ValidatorContext
) {
  return conditions.every((condition) =>
    isConditionMet(condition.conditional, values, context)
  )
}

export type ValidatorContext = {
  user?: ITokenPayload
  leafAdminStructureLocationIds?: Array<{ id: UUID }>
}

function isFieldConditionMet(
  field: FieldConfig,
  form: ActionUpdate | EventState,
  conditionalType: ConditionalType,
  context: ValidatorContext
) {
  const hasRule = (field.conditionals ?? []).some(
    (conditional) => conditional.type === conditionalType
  )

  if (!hasRule) {
    return true
  }

  const validConditionals = getConditionalActionsForField(field, {
    $form: form,
    $now: formatISO(new Date(), { representation: 'date' }),
    $online: isOnline(),
    $user: context.user
  })

  return validConditionals.includes(conditionalType)
}

export function isFieldVisible(
  field: FieldConfig,
  form: ActionUpdate | EventState,
  context: ValidatorContext
) {
  return isFieldConditionMet(field, form, ConditionalType.SHOW, context)
}

function isFieldEmptyAndNotRequired(field: FieldConfig, form: ActionUpdate) {
  const fieldValue = form[field.id]
  return !field.required && (fieldValue === undefined || fieldValue === '')
}

export function isFieldEnabled(
  field: FieldConfig,
  form: ActionUpdate | EventState,
  context: ValidatorContext
) {
  return isFieldConditionMet(field, form, ConditionalType.ENABLE, context)
}

// Fields are displayed on review if both the 'ConditionalType.SHOW' and 'ConditionalType.DISPLAY_ON_REVIEW' conditions are met
export function isFieldDisplayedOnReview(
  field: FieldConfig,
  form: ActionUpdate | EventState,
  context: ValidatorContext
) {
  return (
    isFieldVisible(field, form, context) &&
    isFieldConditionMet(field, form, ConditionalType.DISPLAY_ON_REVIEW, context)
  )
}

export const errorMessages = {
  hiddenField: {
    id: 'error.hidden',
    defaultMessage: 'Hidden or disabled field should not receive a value',
    description:
      'Error message when field is hidden or disabled, but a value was received'
  },
  invalidDate: {
    defaultMessage: 'Invalid date field',
    description: 'Error message when date field is invalid',
    id: 'error.invalidDate'
  },
  invalidEmail: {
    defaultMessage: 'Invalid email address',
    description: 'Error message when email address is invalid',
    id: 'error.invalidEmail'
  },
  requiredField: {
    defaultMessage: 'Required',
    description: 'Error message when required field is missing',
    id: 'error.required'
  },
  invalidInput: {
    defaultMessage: 'Invalid input',
    description: 'Error message when generic field is invalid',
    id: 'error.invalid'
  },
  unexpectedField: {
    defaultMessage: 'Unexpected field',
    description: 'Error message when field is not expected',
    id: 'error.unexpectedField'
  },
  correctionNotAllowed: {
    defaultMessage: 'Correction not allowed for field',
    description: 'Error message when correction is not allowed for field',
    id: 'error.correctionNotAllowed'
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
// In modern Zod, the `issue` parameter is always `z.ZodIssue`.
function zodToIntlErrorMap(
  issue: $ZodIssue,
  value: unknown,
  field: FieldConfig
) {
  const requiredMessage: TranslationConfig =
    field.required && typeof field.required === 'object'
      ? field.required.message
      : errorMessages.requiredField

  switch (issue.code) {
    case 'too_small': {
      if (value === '') {
        return createIntlError(requiredMessage)
      }
      return createIntlError(errorMessages.invalidInput)
    }

    case 'invalid_type': {
      if (
        issue.hasOwnProperty('input') &&
        (issue.input === undefined || issue.input === null)
      ) {
        return createIntlError(requiredMessage)
      }
      return createIntlError(errorMessages.invalidInput)
    }

    case 'invalid_union': {
      for (const unionError of issue.errors) {
        for (const e of unionError) {
          const intlErr = zodToIntlErrorMap(e, value, field)
          if (intlErr.message.message.id !== 'error.required') {
            return createIntlError(errorMessages.invalidInput)
          }
        }
      }
      return createIntlError(requiredMessage)
    }
    case 'invalid_format':
      if (value === '') {
        return createIntlError(requiredMessage)
      }
      if (issue.format === 'date-time' || issue.format === 'date') {
        return createIntlError(errorMessages.invalidDate)
      }
      if (issue.format === 'email') {
        return createIntlError(errorMessages.invalidEmail)
      }
      return createIntlError(errorMessages.invalidInput)
    case 'custom':
    case 'unrecognized_keys':
    case 'invalid_value':
    case 'invalid_key':
    case 'too_big':
    case 'not_multiple_of':
    case 'invalid_element':
      return createIntlError(errorMessages.invalidInput)
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
  const zodType = mapFieldTypeToZod(field.type, !!field.required)

  const rawError = zodType.safeParse(value, {
    // @ts-expect-error
    error: (issue) => zodToIntlErrorMap(issue, value, field)
  })

  // We have overridden the standard error messages
  return (rawError.error?.issues.map((issue) => issue.message) ??
    []) as unknown as {
    message: TranslationConfig
  }[]
}

export function runStructuralValidations({
  field,
  values,
  context
}: {
  field: FieldConfig
  values: ActionUpdate
  context: ValidatorContext
}) {
  if (
    !isFieldVisible(field, values, context) ||
    isFieldEmptyAndNotRequired(field, values)
  ) {
    return []
  }

  const fieldValidationResult = validateFieldInput({
    field,
    value: values[field.id]
  })

  return fieldValidationResult
}

export function runFieldValidations({
  field,
  values,
  context
}: {
  field: FieldConfig
  values: ActionUpdate
  context: ValidatorContext
}) {
  if (
    !isFieldVisible(field, values, context) ||
    isFieldEmptyAndNotRequired(field, values)
  ) {
    return []
  }

  const conditionalParameters = {
    $form: values,
    $now: formatISO(new Date(), { representation: 'date' }),
    /**
     * In real use cases, there can be hundreds of thousands of locations.
     * Make sure that the context contains only the locations that are needed for validation.
     * E.g. if the user is a leaf admin, only the leaf locations under their admin structure are needed.
     * Loading few megabytes of locations to memory just for validation is not efficient and will choke the application.
     */
    $leafAdminStructureLocationIds: context.leafAdminStructureLocationIds ?? [],
    $online: isOnline(),
    $user: context.user
  }

  const fieldValidationResult = validateFieldInput({
    field,
    value: values[field.id]
  })

  const customValidationResults = runCustomFieldValidations({
    field,
    conditionalParameters
  })

  // Assumes that custom validation errors are based on the field type, and extend the validation.
  return [...fieldValidationResult, ...customValidationResults]
}

export function getValidatorsForField(
  fieldId: FieldConfig['id'],
  validations: NonNullable<FieldConfig['validation']>
): NonNullable<FieldConfig['validation']> {
  return validations
    .map(({ validator, message }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jsonSchema = validator as any
      /*
       * It’s possible the validator is an or(...) / and(...) / similar combinator.
       * From these it's tricky to extract field-specific validation:
       *
       * Currently we assume a plain object validator:
       *   { firstname: aValidator, middlename: bValidator, lastname: cValidator }
       * so "lastname" → cValidator directly.
       *
       * But with something like:
       *   (firstname: aValidator) OR (middlename: bValidator) OR (lastname: cValidator)
       * or even more nested logical combinations, there’s no clear properties structure
       * (similar to JSON Schema `anyOf` not exposing `properties`).
       *
       * Handling all those cases is left unimplemented for now due to complexity/time.
       */
      if (!jsonSchema.properties) {
        return null
      }

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
          $id: jsonSchema.$id + '.' + fieldId,
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

export function areCertificateConditionsMet(
  conditions: FieldConditional[],
  values: ConditionalParameters
) {
  return conditions.every((condition) => {
    return validate(condition.conditional, values)
  })
}
