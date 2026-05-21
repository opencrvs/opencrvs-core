/* eslint-disable max-lines */
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
import { ErrorMapCtx, z, ZodIssueOptionalMessage } from 'zod'
import { formatISO, isAfter, isBefore } from 'date-fns'

import { ConditionalParameters, JSONSchema } from './conditionals'
import { ActionUpdate, EventState } from '../events/ActionDocument'
import { ConditionalType, FieldConditional } from '../events/Conditional'
import { FieldConfig } from '../events/FieldConfig'
import {
  mapFieldTypeToZod,
  isFieldGroupFieldType
} from '../events/FieldTypeMapping'
import {
  PlainDate,
  FieldUpdateValue,
  FieldValue,
  AgeValue
} from '../events/FieldValue'
import { TranslationConfig } from '../events/TranslationConfig'
import { ITokenPayload } from '../authentication'
import { UUID } from '../uuid'
import {
  ageToDate,
  buildFormState,
  flattenFormState,
  FormState
} from '../events/utils'
import { ActionType } from '../events/ActionType'
import { EventDocument } from '../events/EventDocument'
import { Location } from '../events/locations'
import { SystemVariables } from '../events/TemplateConfig'

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

function resolveDataPath(
  rootData: Record<string, unknown>,
  dataPath: string,
  instancePath: string
): unknown {
  const pathParts = dataPath.split('/')

  // First part is the depth level (how many levels up to traverse)
  const levels = parseInt(pathParts[0], 10)
  const referencePath = pathParts.slice(1)

  // Parse instancePath to get current location
  // instancePath looks like: "/$form/mother.dob"
  const instanceParts = instancePath.split('/').filter(Boolean) // Remove empty strings

  // Traverse up by `levels` from current location
  const traversedParts = instanceParts.slice(0, -levels)

  // Start from rootData and navigate to the traversed location
  let current: unknown | Record<string, unknown> = rootData
  for (const part of traversedParts) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  // Now navigate using the reference path from that location
  for (const part of referencePath) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

/** Returns today's date as an ISO date string (YYYY-MM-DD). */
export function todayISO(): string {
  return formatISO(new Date(), { representation: 'date' })
}

/**
 * Context passed to every serialised client-side function ({@link runClientFunction}).
 *
 * `$user` (full {@link ITokenPayload}, validator paths) and `user` (a
 * {@link SystemVariables} subset for template substitution, default-value
 * path) are distinct sources, not duplicates.
 */
export type ClientFunctionContext = {
  $form: EventState | Record<string, unknown>
  $now: string
  $online: boolean
  $user?: ITokenPayload
  $event?: EventDocument
  $leafAdminStructureLocationIds: Array<{ id: UUID }>
  user?: SystemVariables['user']
  $window?: SystemVariables['$window']
  locations?: Location[]
  adminLevelIds?: string[]
}

// `data` is `FieldValue | undefined` because validators receive the field
// value being validated, while default-value evaluators receive `undefined`.
type CompiledClientFunction = (
  data: FieldValue | undefined,
  context: ClientFunctionContext
) => unknown

const compiledFunctionCache = new Map<string, CompiledClientFunction>()

/**
 * Deserialises a serialised function string (produced by `.toString()`) into a callable.
 * Results are cached by code string so each unique function body is compiled at most once.
 * Runs in a clean scope — no access to outer closures or external imports.
 */
export function compileClientFunction(code: string): CompiledClientFunction {
  let fn = compiledFunctionCache.get(code)
  if (!fn) {
    fn = new Function(`return (${code})`)() as CompiledClientFunction
    compiledFunctionCache.set(code, fn)
  }
  return fn
}

// https://ajv.js.org/packages/ajv-formats.html
addFormats(ajv)

// `$now` / `$online` are sampled fresh on each call — callers that care
// about a stable timestamp/online flag should snapshot it themselves.
export function buildClientFunctionContext(input: {
  form: EventState | Record<string, unknown>
  validatorContext?: ValidatorContext
  systemVariables?: SystemVariables
  locations?: Location[]
  adminLevelIds?: string[]
}): ClientFunctionContext {
  return {
    $form: input.form,
    $now: todayISO(),
    $online: isOnline(),
    $user: input.validatorContext?.user,
    $event: input.validatorContext?.event,
    $leafAdminStructureLocationIds:
      input.validatorContext?.leafAdminStructureLocationIds ?? [],
    user: input.systemVariables?.user,
    $window: input.systemVariables?.$window,
    locations: input.locations,
    adminLevelIds: input.adminLevelIds
  }
}

export function runClientFunction(
  code: string,
  data: FieldValue | undefined,
  context: ClientFunctionContext
): unknown {
  return compileClientFunction(code)(data, context)
}

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
 *       "daysFromDate": {
 *         "days": 30,
 *         "clause": "before",
 *         "referenceDate": { "$data": "1/child.dob" } // optional, defaults to $now
 *       }
 *    }
 * }
 */
ajv.addKeyword({
  keyword: 'daysFromDate',
  type: 'string',
  schemaType: 'object',
  $data: true,
  errors: true,
  validate(
    schema: {
      days: number
      clause: 'after' | 'before'
      referenceDate?: string | { $data: string }
    },
    data: string,
    _: unknown,
    dataContext?: { rootData: unknown; instancePath: string }
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

    let referenceDate = schema.referenceDate

    if (
      referenceDate &&
      typeof referenceDate === 'object' &&
      '$data' in referenceDate
    ) {
      /**
       * For some reason AJV does not resolve $data references automatically inside custom keywords
       * So we have to do it manually here
       */
      referenceDate = resolveDataPath(
        dataContext.rootData,
        referenceDate.$data,
        dataContext.instancePath
      ) as string
    }

    if (!referenceDate) {
      referenceDate = dataContext.rootData.$now
    }

    const baseDate = new Date(referenceDate)

    if (isNaN(baseDate.getTime())) {
      return false
    }

    const offsetDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)

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
  validate(_schema: {}, data: string, _: unknown, dataContext?: DataContext) {
    const locationIdInput = data
    const locations = dataContext?.rootData.$leafAdminStructureLocationIds ?? []

    return locations.some((location) => location.id === locationIdInput)
  }
})

function mergeWithBaseFormState(
  values: EventState | ActionUpdate,
  context: ValidatorContext
) {
  return { ...context.baseFormState, ...values }
}

ajv.addKeyword({
  keyword: 'customClientValidator',
  schemaType: 'object',
  errors: true,
  // @ts-expect-error -- AJV's public types don't expose `rootData`. All
  // `validate()` callers build root data via `buildClientFunctionContext`,
  // so the cast holds.
  validate(
    schema: { code: string },
    data: FieldValue,
    _: unknown,
    dataContext?: { rootData: ClientFunctionContext; instancePath: string }
  ) {
    // External references (lodash etc.) are intentionally unavailable — validators must be
    // self-contained so they survive serialisation into JSONSchema and transmission to core.
    return Boolean(
      runClientFunction(
        schema.code,
        data,
        dataContext?.rootData ?? buildClientFunctionContext({ form: {} })
      )
    )
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
          const maybeAsOfDate = PlainDate.safeParse(
            data.$form[maybeAgeValue.data.asOfDateRef]
          )

          return [
            key,
            {
              age,
              dob: ageToDate(
                age,
                maybeAsOfDate.success
                  ? maybeAsOfDate.data
                  : PlainDate.parse(data.$now)
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
  values: EventState | ActionUpdate,
  context: ValidatorContext
) {
  return validate(
    conditional,
    buildClientFunctionContext({
      form: mergeWithBaseFormState(values, context),
      validatorContext: context
    })
  )
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
  event?: EventDocument
  baseFormState?: EventState
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

  const validConditionals = getConditionalActionsForField(
    field,
    buildClientFunctionContext({
      form: mergeWithBaseFormState(form, context),
      validatorContext: context
    })
  )

  return validConditionals.includes(conditionalType)
}

export function isFieldVisible(
  field: FieldConfig,
  form: Partial<ActionUpdate | EventState>,
  context: ValidatorContext
) {
  return isFieldConditionMet(field, form, ConditionalType.SHOW, context)
}

function isFieldEmptyAndNotRequired(field: FieldConfig, form: ActionUpdate) {
  const fieldValue = form[field.id]
  return (
    !field.required &&
    (fieldValue === undefined ||
      fieldValue === '' ||
      (fieldValue &&
        typeof fieldValue === 'object' &&
        Object.values(fieldValue).every((v) => v === undefined || v === '')))
  )
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
function zodToIntlErrorMap(
  issue: ZodIssueOptionalMessage,
  _ctx: ErrorMapCtx,
  field: FieldConfig
) {
  const requiredMessage: TranslationConfig =
    field.required && typeof field.required === 'object'
      ? field.required.message
      : errorMessages.requiredField
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (issue.code) {
    case 'invalid_string': {
      if (_ctx.data === '') {
        return createIntlError(requiredMessage)
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
      if (
        issue.expected !== issue.received &&
        (issue.received === 'undefined' || issue.received === 'null')
      ) {
        return createIntlError(requiredMessage)
      }

      break
    }
    case 'too_small': {
      if (issue.message === undefined) {
        return createIntlError(requiredMessage)
      }

      break
    }
    case 'invalid_union': {
      for (const { issues } of issue.unionErrors) {
        for (const e of issues) {
          if (
            zodToIntlErrorMap(e, _ctx, field).message.message.id !==
            'error.required'
          ) {
            return createIntlError(errorMessages.invalidInput)
          }
        }
      }
      return createIntlError(requiredMessage)
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
  value,
  actionType
}: {
  field: FieldConfig
  value: FieldUpdateValue
  actionType?: ActionType
}) {
  const zodType = mapFieldTypeToZod(field, actionType)

  const rawError = zodType.safeParse(value, {
    // @ts-expect-error
    errorMap: (issue, _ctx) => zodToIntlErrorMap(issue, _ctx, field)
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
  context,
  actionType
}: {
  field: FieldConfig
  values: ActionUpdate
  context: ValidatorContext
  actionType?: ActionType
}) {
  if (
    !isFieldVisible(field, values, context) ||
    isFieldEmptyAndNotRequired(field, values)
  ) {
    return []
  }

  const fieldValidationResult = validateFieldInput({
    field,
    value: values[field.id],
    actionType
  })

  return fieldValidationResult
}

export function runFieldValidations({
  field: config,
  form,
  value,
  context
}: {
  field: FieldConfig
  value: FieldUpdateValue
  form: ActionUpdate
  context: ValidatorContext
}): FormState<Array<{ message: TranslationConfig }>> {
  const field = { config, value }
  if (!isFieldVisible(field.config, form, context)) {
    return []
  }
  // `leafAdminStructureLocationIds` must already be narrowed by the caller
  // (e.g. to the user's admin scope) — there can be hundreds of thousands of
  // locations in real deployments, and loading them all into memory chokes
  // the app.
  const conditionalParameters = buildClientFunctionContext({
    form: mergeWithBaseFormState(form, context),
    validatorContext: context
  })

  if (isFieldGroupFieldType(field)) {
    const subfieldErrors: FormState<Array<{ message: TranslationConfig }>> =
      buildFormState(field.config.fields, (subfield) =>
        runFieldValidations({
          field: subfield,
          value: field.value?.[subfield.id],
          form,
          context
        })
      )

    if (flattenFormState(subfieldErrors).length !== 0) {
      return subfieldErrors
    }

    // run group validations only when subfields do not contain any errors
    return runCustomFieldValidations({
      field: field.config,
      conditionalParameters
    })
  }

  // FIELD_GROUP does not need the "required" property
  if (isFieldEmptyAndNotRequired(field.config, form)) {
    return []
  }

  const fieldValidationResult = validateFieldInput({
    field: field.config,
    value
  })

  const customValidationResults = runCustomFieldValidations({
    field: field.config,
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
