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

import { EventDocument } from '../events/EventDocument'
import { EventState } from '../events/ActionDocument'
import { ITokenPayload as TokenPayload, Scope } from '../authentication'
import { ActionType } from '../events/ActionType'
import { PartialSchema as AjvJSONSchemaType } from 'ajv/dist/types/json-schema'

/** @knipignore */
export type JSONSchema = {
  readonly __nominal__type: 'JSONSchema'
}

export function defineConditional(schema: any) {
  return schema as JSONSchema
}

export type UserConditionalParameters = { $now: string; $user: TokenPayload }
export type EventConditionalParameters = { $now: string; $event: EventDocument }
// @TODO: Reconcile which types should be used. The same values are used within form and config. In form values can be undefined, for example.
export type FormConditionalParameters = {
  $now: string
  $form: EventState | Record<string, any>
}

export type ConditionalParameters =
  | UserConditionalParameters
  | EventConditionalParameters
  | FormConditionalParameters

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
 *
 * Generate conditional rules for user.
 */
export const user = {
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
    })
}

/**
 *
 * Generate conditional rules for event.
 */
export const event = {
  hasAction: (action: ActionType) =>
    defineConditional({
      type: 'object',
      properties: {
        $event: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              contains: {
                type: 'object',
                properties: {
                  type: {
                    const: action
                  }
                },
                required: ['type']
              }
            }
          },
          required: ['actions']
        }
      },
      required: ['$event']
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
export function field(fieldId: string) {
  const getDateFromNow = (days: number) =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

  const getDateRange = (
    date: string,
    clause: 'formatMinimum' | 'formatMaximum'
  ) => ({
    type: 'object',
    properties: {
      $form: {
        type: 'object',
        properties: {
          [fieldId]: {
            type: 'string',
            format: 'date',
            [clause]: date
          }
        },
        required: [fieldId]
      }
    },
    required: ['$form']
  })

  return {
    __returning: fieldId,
    isAfter: () => ({
      days: (days: number) => ({
        inPast: () =>
          defineConditional(
            getDateRange(getDateFromNow(days), 'formatMinimum')
          ),
        inFuture: () =>
          defineConditional(
            getDateRange(getDateFromNow(-days), 'formatMinimum')
          )
      }),
      date: (date: string) =>
        defineConditional(getDateRange(date, 'formatMinimum')),
      now: () =>
        defineConditional(getDateRange(getDateFromNow(0), 'formatMinimum'))
    }),
    isBefore: () => ({
      days: (days: number) => ({
        inPast: () =>
          defineConditional(
            getDateRange(getDateFromNow(days), 'formatMaximum')
          ),
        inFuture: () =>
          defineConditional(
            getDateRange(getDateFromNow(-days), 'formatMaximum')
          )
      }),
      date: (date: string) =>
        defineConditional(getDateRange(date, 'formatMaximum')),
      now: () =>
        defineConditional(getDateRange(getDateFromNow(0), 'formatMaximum'))
    }),
    isEqualTo: (value: string | boolean | { __returning: string }) => {
      let resolvedValue: string | boolean | object = value

      if (typeof value === 'object' && value.__returning) {
        resolvedValue = { $data: `1/$form.${value.__returning}` }
        console.log('resolvedValue', resolvedValue)
      }

      return defineConditional({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                oneOf: [
                  { type: 'string', const: value },
                  { type: 'boolean', const: value }
                ],
                const: value
              }
            },
            required: [fieldId]
          }
        },
        required: ['$form']
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
    isFalsy: () =>
      defineConditional({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                anyOf: [
                  { const: 'undefined' },
                  { const: false },
                  { const: null },
                  { const: '' }
                ]
              }
            },
            anyOf: [
              {
                required: [fieldId]
              },
              {
                not: {
                  required: [fieldId]
                }
              }
            ]
          }
        },
        required: ['$form']
      }),
    isUndefined: () =>
      defineConditional({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                type: 'string',
                enum: ['undefined']
              }
            },
            not: {
              required: [fieldId]
            }
          }
        },
        required: ['$form']
      }),
    inArray: (values: string[]) =>
      defineConditional({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                type: 'string',
                enum: values
              }
            },
            required: [fieldId]
          }
        },
        required: ['$form']
      }),
    isValidEnglishName: () =>
      defineConditional({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                type: 'string',
                pattern:
                  "^[\\p{Script=Latin}0-9'._-]*(\\([\\p{Script=Latin}0-9'._-]+\\))?[\\p{Script=Latin}0-9'._-]*( [\\p{Script=Latin}0-9'._-]*(\\([\\p{Script=Latin}0-9'._-]+\\))?[\\p{Script=Latin}0-9'._-]*)*$",
                description:
                  "Name must contain only letters, numbers, and allowed special characters ('._-). No double spaces."
              }
            },
            required: [fieldId]
          }
        },
        required: ['$form']
      }),
    isValidNationalId: () =>
      defineConditional({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                type: 'string',
                pattern: '^[0-9]{9}$',
                description:
                  'The National ID can only be numeric and must be 9 digits long.'
              }
            },
            required: [fieldId]
          }
        },
        required: ['$form']
      }),
    /**
     * Checks if the field value matches a given regular expression pattern.
     * @param pattern - The regular expression pattern to match the field value against.
     * @returns A JSONSchema conditional that validates the field value against the pattern.
     */
    matches: (pattern: string) =>
      defineConditional({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                type: 'string',
                pattern
              }
            },
            required: [fieldId]
          }
        },
        required: ['$form']
      }),
    isBetween: (min: number, max: number) =>
      defineConditional({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                type: 'number',
                minimum: min,
                maximum: max
              }
            },
            required: [fieldId]
          }
        },
        required: ['$form']
      })
  }
}
