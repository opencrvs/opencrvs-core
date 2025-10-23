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
import * as objectHash from 'object-hash'
import { EventDocument } from '../events/EventDocument'
import { EventState } from '../events/ActionDocument'
import { ITokenPayload as TokenPayload, Scope } from '../authentication'
import { PartialSchema as AjvJSONSchemaType } from 'ajv/dist/types/json-schema'
import { userSerializer } from '../events/serializers/user/serializer'
import { omitKeyDeep } from '../utils'
import { UUID } from '../uuid'

/* eslint-disable max-lines */

/** @knipignore */
export type JSONSchema = {
  $id: string
  readonly __nominal__type: 'JSONSchema'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineConditional(schema: any) {
  // The same conditional schema may appear multiple times in the final schema.
  // This causes duplicate $id values (since the hash is identical), and Ajv
  // throws a `resolves to more than one schema` error.
  // To avoid this, we only keep $id at the top level and remove it from all nested schemas.
  const schemaWithooutIDRef = omitKeyDeep(schema, '$id')
  return {
    $id: `https://opencrvs.org/conditionals/${objectHash.sha1(schemaWithooutIDRef)}`,
    ...schemaWithooutIDRef
  } as JSONSchema
}

export function defineFormConditional(schema: Record<string, unknown>) {
  const schemaWithForm = {
    type: 'object',
    properties: {
      $form: schema
    },
    required: ['$form']
  }

  return defineConditional(schemaWithForm)
}

export type UserConditionalParameters = {
  $now: string
  $online: boolean
  $user: TokenPayload
}
export type EventConditionalParameters = {
  $now: string
  $online: boolean
  $event: EventDocument
}
// @TODO: Reconcile which types should be used. The same values are used within form and config. In form values can be undefined, for example.
export type FormConditionalParameters = {
  $now: string
  $online: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $form: EventState | Record<string, any>
  $locations?: Array<{ id: UUID }>
}

export type ConditionalParameters =
  | UserConditionalParameters
  | EventConditionalParameters
  | FormConditionalParameters

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type AjvJSONSchema = AjvJSONSchemaType<
  UnionToIntersection<ConditionalParameters>
>

/**
 * Returns an empty JSON Schema object, which is treated as always valid.
 *
 * @returns {AjvJSONSchema} An empty schema object `{}` that always evaluates to true.
 */
export function alwaysTrue(): AjvJSONSchema {
  return {}
}

/**
 * Universal boolean connector to be used with any type of conditional. (user, event, field)
 *
 * @example and(field('foo').isEqualTo('bar'), field('baz').isUndefined())
 */
export function and(...conditions: AjvJSONSchema[]): JSONSchema {
  return defineConditional({
    type: 'object',
    allOf: conditions,
    required: []
  })
}

/**
 * Universal boolean connector to be used with any type of conditional. (user, event, field)
 *
 * @example or(field('foo').isEqualTo('bar'), field('baz').isUndefined())
 */
export function or(...conditions: AjvJSONSchema[]): JSONSchema {
  return defineConditional({
    type: 'object',
    anyOf: conditions,
    required: []
  })
}

/**
 * Universal boolean connector to be used with any type of conditional. (user, event, field)
 *
 * @example not(field('foo').isEqualTo('bar'))
 */
export function not(condition: AjvJSONSchema): JSONSchema {
  return defineConditional({
    type: 'object',
    not: condition,
    required: []
  })
}

/**
 * Returns an JSON Schema object, which is treated as always invalid.
 *
 * @returns {JSONSchema} An schema object that always evaluates to false.
 */
export function never(): JSONSchema {
  return not(alwaysTrue())
}

type FieldReference = { $$field: string; $$subfield: string[] }

function jsonFieldPath(field: FieldReference) {
  return [field.$$field, ...field.$$subfield].join('/')
}

function wrapToPath(condition: Record<string, unknown>, path: string[]) {
  if (path.length === 0) {
    return condition
  }
  return path.reduceRight((conditionNow, part) => {
    return {
      type: 'object',
      properties: {
        [part]: conditionNow
      },
      required: [part]
    }
  }, condition)
}

function wrapToPathOptional(
  condition: Record<string, unknown>,
  path: string[]
) {
  if (path.length === 0) {
    return condition
  }
  return path.reduceRight((conditionNow, part) => {
    return {
      type: 'object',
      properties: { [part]: conditionNow }
    }
  }, condition)
}

/**
 *
 * Generate conditional rules for user.
 */
export const user = Object.assign(userSerializer, {
  hasScope: (scope: Scope) =>
    defineConditional({
      type: 'object',
      properties: {
        $user: {
          type: 'object',
          required: ['scope'],
          properties: {
            scope: {
              type: 'array',
              contains: {
                type: 'string',
                const: scope
              }
            }
          }
        }
      },
      required: ['$user']
    }),
  hasRole: (role: string) =>
    defineConditional({
      type: 'object',
      properties: {
        $user: {
          type: 'object',
          required: ['role'],
          properties: {
            role: {
              type: 'string',
              const: role
            }
          }
        }
      },
      required: ['$user']
    }),
  isOnline: () =>
    defineConditional({
      type: 'object',
      properties: {
        $online: {
          type: 'boolean',
          const: true
        }
      },
      required: ['$online']
    }),
  locationLevel: (adminLevelId: string) => ({
    $user: {
      $location: adminLevelId
    }
  })
})

export function isFieldReference(value: unknown): value is FieldReference {
  return typeof value === 'object' && value !== null && '$$field' in value
}

/**
 * This function will output JSONSchema which looks for example like this:
 * @example
 * {
 *   "type": "object",
 *   "properties": {
 *     "mother.dob": {
 *       "type": "string",
 *       "format": "date",
 *       "formatMinimum": {
 *         "$data": "1/child.dob"
 *       }
 *     },
 *     "child.dob": {
 *       "type": "string",
 *       "format": "date"
 *     }
 *   },
 *   "required": ["mother.dob"]
 * }
 */
function getDateRangeToFieldReference(
  field: FieldReference,
  comparedField: FieldReference,
  clause: 'formatMinimum' | 'formatMaximum'
) {
  return {
    type: 'object',
    properties: {
      [field.$$field]: wrapToPath(
        {
          type: 'string',
          format: 'date',
          [clause]: {
            $data: `${field.$$subfield.length + 1}/${jsonFieldPath(comparedField)}`
          }
        },
        field.$$subfield
      ),
      [comparedField.$$field]: wrapToPath(
        { type: 'string', format: 'date' },
        comparedField.$$subfield
      )
    },
    required: [field.$$field]
  }
}

function defineComparison(
  field: FieldReference,
  value: number | FieldReference,
  keyword: 'exclusiveMinimum' | 'exclusiveMaximum'
) {
  if (isFieldReference(value)) {
    const comparedField = value
    return defineFormConditional({
      type: 'object',
      properties: {
        [field.$$field]: wrapToPath(
          {
            type: ['number'],
            [keyword]: {
              $data: `${field.$$subfield.length + 1}/${jsonFieldPath(comparedField)}`
            }
          },
          field.$$subfield
        ),
        [comparedField.$$field]: wrapToPath(
          { type: 'number' },
          comparedField.$$subfield
        )
      },
      required: [field.$$field]
    })
  }
  return defineFormConditional({
    type: 'object',
    properties: {
      [field.$$field]: wrapToPath(
        { type: 'number', [keyword]: value },
        field.$$subfield
      )
    },
    required: [field.$$field]
  })
}

/**
 * Generate conditional rules for a form field.
 *
 * @param fieldId - The field ID condition is applied to.
 * @example to combine multiple conditions, utilise connectors like `and`, `or`, `not`:
 *  and(field('foo').isEqualTo('bar'), field('baz').isUndefined())
 *
 */

export function createFieldConditionals(fieldId: string) {
  const getDayRange = (
    field: FieldReference,
    days: number,
    clause: 'before' | 'after'
  ) => ({
    type: 'object',
    properties: {
      [field.$$field]: wrapToPath(
        {
          type: 'string',
          format: 'date',
          daysFromNow: {
            days,
            clause
          }
        },
        field.$$subfield
      )
    },
    required: [field.$$field]
  })

  const getDateRange = (
    field: FieldReference,
    date: string | FieldReference | { $data: '/$now' },
    clause: 'formatMinimum' | 'formatMaximum'
  ) => ({
    type: 'object',
    properties: {
      [field.$$field]: wrapToPath(
        {
          type: 'string',
          format: 'date',
          [clause]: date
        },
        field.$$subfield
      )
    },
    required: [field.$$field]
  })

  return {
    /**
     * @private Internal property used for field reference tracking.
     */
    $$field: fieldId,
    /**
     * @private Internal property used for solving a object path within field's value
     */
    $$subfield: [] as string[],
    get(fieldPath: string) {
      return {
        ...this,
        $$subfield: fieldPath.split('.')
      }
    },
    asDob() {
      return this.get('dob')
    },
    asAge() {
      return this.get('age')
    },
    isAfter() {
      return {
        days: (days: number) => ({
          inPast: () =>
            defineFormConditional(getDayRange(this, -days, 'after')),
          inFuture: () =>
            defineFormConditional(getDayRange(this, days, 'after'))
        }),
        date: (date: string | FieldReference) => {
          if (isFieldReference(date)) {
            const comparedField = date
            return defineFormConditional(
              getDateRangeToFieldReference(this, comparedField, 'formatMinimum')
            )
          }

          return defineFormConditional(
            getDateRange(this, date, 'formatMinimum')
          )
        },
        now: () =>
          defineFormConditional(
            getDateRange(this, { $data: '/$now' }, 'formatMinimum')
          )
      }
    },
    isBefore() {
      return {
        days: (days: number) => ({
          inPast: () =>
            defineFormConditional(getDayRange(this, -days, 'before')),
          inFuture: () =>
            defineFormConditional(getDayRange(this, days, 'before'))
        }),
        date: (date: `${string}-${string}-${string}` | FieldReference) => {
          if (isFieldReference(date)) {
            const comparedField = date
            return defineFormConditional(
              getDateRangeToFieldReference(this, comparedField, 'formatMaximum')
            )
          }

          return defineFormConditional(
            getDateRange(this, date, 'formatMaximum')
          )
        },
        now: () =>
          defineFormConditional(
            getDateRange(this, { $data: '/$now' }, 'formatMaximum')
          )
      }
    },
    isGreaterThan(value: number | FieldReference) {
      return defineComparison(this, value, 'exclusiveMinimum')
    },
    isLessThan(value: number | FieldReference) {
      return defineComparison(this, value, 'exclusiveMaximum')
    },
    isEqualTo(value: string | boolean | number | FieldReference) {
      // If the value is a reference to another field, the JSON schema uses the field reference as the 'const' value we compare to
      if (isFieldReference(value)) {
        const comparedField = value

        return defineFormConditional({
          type: 'object',
          properties: {
            [this.$$field]: wrapToPath(
              {
                type: ['string', 'boolean', 'number'],
                const: {
                  $data: `/$form/${jsonFieldPath(comparedField)}`
                }
              },
              this.$$subfield
            ),
            [comparedField.$$field]: wrapToPath(
              { type: ['string', 'boolean', 'number'] },
              comparedField.$$subfield
            )
          },
          required: [this.$$field, comparedField.$$field]
        })
      }

      return defineFormConditional({
        type: 'object',
        properties: {
          [this.$$field]: wrapToPath(
            {
              type: ['string', 'boolean', 'number'],
              const: value
            },
            this.$$subfield
          )
        },
        required: [this.$$field]
      })
    },
    /**
     * Use case: Some fields are rendered when selection is not made, or boolean false is explicitly selected.
     * @example field('recommender.none').isFalsy() vs not(field('recommender.none').isEqualTo(true))
     * @returns whether the field is falsy (undefined, false, null, empty string)
     *
     * NOTE: For now, this only works with string, boolean, and null types. 0 is still allowed.
     *
     */
    isFalsy() {
      // if we're targeting a nested leaf, be lenient about the parent shape
      const hasSubpath = this.$$subfield.length > 0

      const falsyLeaf = {
        anyOf: [
          { const: 'undefined' },
          { const: false },
          { const: null },
          { const: '' }
        ]
      }

      return defineFormConditional({
        type: 'object',
        properties: {
          [fieldId]: hasSubpath
            ? {
                // either the whole parent is null (treat as undefined),
                // or the nested leaf is falsy
                anyOf: [
                  { const: null },
                  wrapToPathOptional(falsyLeaf, this.$$subfield)
                ]
              }
            : falsyLeaf
        },
        anyOf: [{ required: [fieldId] }, { not: { required: [fieldId] } }]
      })
    },
    isUndefined() {
      return defineFormConditional({
        type: 'object',
        properties: {
          [fieldId]: wrapToPath(
            {
              type: 'string',
              enum: ['undefined']
            },
            this.$$subfield
          )
        },
        not: {
          required: [fieldId]
        }
      })
    },
    inArray(values: string[]) {
      return defineFormConditional({
        type: 'object',
        properties: {
          [fieldId]: wrapToPath(
            {
              type: 'string',
              enum: values
            },
            this.$$subfield
          )
        },
        required: [fieldId]
      })
    },
    isValidEnglishName: () =>
      defineFormConditional({
        type: 'object',
        properties: {
          [fieldId]: {
            type: 'string',
            minLength: 1,
            pattern:
              "^[\\p{Script=Latin}0-9'.-]*(\\([\\p{Script=Latin}0-9'.-]+\\))?[\\p{Script=Latin}0-9'.-]*( [\\p{Script=Latin}0-9'.-]*(\\([\\p{Script=Latin}0-9'.-]+\\))?[\\p{Script=Latin}0-9'.-]*)*$",
            description:
              "Name must contain only letters, numbers, and allowed special characters ('.-). No double spaces."
          }
        }
      }),
    isValidAdministrativeLeafLevel() {
      return defineFormConditional({
        type: 'object',
        properties: {
          [fieldId]: wrapToPath(
            {
              type: 'object',
              properties: {
                administrativeArea: {
                  type: 'string',
                  isLeafLevelLocation: true
                }
              },
              description:
                'The provided administrative value should have a value corresponding to the required lowest administrative level'
            },
            this.$$subfield
          )
        }
      })
    },
    /**
     * Checks if the field value matches a given regular expression pattern.
     * @param pattern - The regular expression pattern to match the field value against.
     * @returns A JSONSchema conditional that validates the field value against the pattern.
     */
    matches(pattern: string) {
      return defineFormConditional({
        type: 'object',
        properties: wrapToPath(
          {
            [fieldId]: {
              type: 'string',
              pattern
            }
          },
          this.$$subfield
        ),
        required: [fieldId]
      })
    },
    isBetween(min: number, max: number) {
      return defineFormConditional({
        type: 'object',
        properties: {
          [fieldId]: wrapToPath(
            {
              type: 'number',
              minimum: min,
              maximum: max
            },
            this.$$subfield
          )
        },
        required: [fieldId]
      })
    },
    getId: () => ({ fieldId }),
    /**
     * @deprecated
     * use field(fieldId).get(nestedProperty) instead
     * with 'and' combinator e.g.
     * and(
     *   field('child.name').get('firstname').isEqualTo('John'),
     *   field('child.name').get('surname').isEqualTo('Doe')
     * )
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: (options: Record<string, any>) =>
      defineFormConditional({
        type: 'object',
        properties: {
          [fieldId]: {
            type: 'object',
            properties: Object.fromEntries(
              Object.entries(options).map(([key, value]) => {
                return [key, value.properties.$form.properties[key]]
              })
            ),
            required: Object.keys(options)
          }
        },
        required: [fieldId]
      })
  }
}
