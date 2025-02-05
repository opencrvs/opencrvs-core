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

import {
  ConditionalParameters,
  defineConditional,
  JSONSchema
} from '@opencrvs/commons/conditionals'
import { ActionType } from '@opencrvs/commons/events'
import { JSONSchemaType as AjvJSONSchemaType } from 'ajv'
export * as deduplication from './deduplication'

export { defineConditional } from '@opencrvs/commons/conditionals'

type ReplacePropertiesWithPartial<T> = {
  [K in keyof T]: K extends 'properties'
    ? Partial<T[K]>
    : T[K] extends Record<string, unknown>
    ? ReplacePropertiesWithPartial<T[K]>
    : T[K]
}
type AjvJSONSchema = ReplacePropertiesWithPartial<
  AjvJSONSchemaType<ConditionalParameters>
>

export function and(...conditions: AjvJSONSchema[]): JSONSchema {
  return defineConditional({
    type: 'object',
    allOf: conditions
  })
}

export function or(...conditions: AjvJSONSchema[]): JSONSchema {
  return defineConditional({
    type: 'object',
    anyOf: conditions
  })
}

export function not(condition: AjvJSONSchema): JSONSchema {
  return defineConditional({
    type: 'object',
    not: condition
  })
}

export function userHasScope(scope: string) {
  return {
    properties: {
      $user: {
        required: ['scope'],
        properties: {
          scope: {
            contains: {
              type: 'string',
              const: scope
            }
          }
        }
      }
    },
    required: ['$user']
  }
}

export function eventHasAction(type: ActionType) {
  return {
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
                  const: type
                },
                draft: {
                  type: 'boolean'
                }
              },
              required: ['type'],
              not: {
                properties: {
                  draft: {
                    const: true
                  }
                }
              }
            }
          }
        },
        required: ['actions']
      }
    },
    required: ['$event']
  }
}

export type FieldAPI = {
  inArray: (values: string[]) => FieldAPI
  isBeforeNow: () => FieldAPI
  isEqualTo: (value: string) => FieldAPI
  isUndefined: () => FieldAPI
  not: {
    inArray: (values: string[]) => FieldAPI
    equalTo: (value: string) => FieldAPI
  }
  /**
   * joins multiple conditions with OR instead of AND.
   * @example field('fieldId').or((field) => field.isUndefined().not.inArray(['value1', 'value2'])).apply()
   */
  or: (callback: (field: FieldAPI) => FieldAPI) => FieldAPI
  /**
   *  @private
   *  @returns array of conditions. Used internally by methods that consolidate multiple conditions into one.
   */
  _apply: () => AjvJSONSchema[]
  /**
   * @public
   * @returns single object for consolidated conditions
   */
  apply: () => JSONSchema
}

/**
 * Generate conditional rules for a field.
 * @param fieldId - The field ID conditions are being applied to
 *
 * @returns @see FieldAPI
 */
export function field(fieldId: string) {
  const conditions: AjvJSONSchema[] = []

  const addCondition = (rule: AjvJSONSchema) => {
    conditions.push(rule)
    return api
  }

  const api: FieldAPI = {
    isBeforeNow: () =>
      addCondition({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                type: 'string',
                format: 'date',
                formatMaximum: { $data: '2/$now' }
              }
            },
            required: [fieldId]
          },
          $now: {
            type: 'string',
            format: 'date'
          }
        },
        required: ['$form', '$now']
      }),
    isEqualTo: (value: string) =>
      addCondition({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                type: 'string',
                const: value
              }
            },
            required: [fieldId]
          }
        },
        required: ['$form']
      }),
    isUndefined: () =>
      addCondition({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            not: {
              type: 'object',
              required: [fieldId]
            },
            required: ['$form']
          }
        },
        required: ['$form']
      }),
    inArray: (values: string[]) =>
      addCondition({
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
    not: {
      inArray: (values: string[]) =>
        addCondition({
          type: 'object',
          properties: {
            $form: {
              type: 'object',
              properties: {
                [fieldId]: {
                  type: 'string',
                  not: {
                    enum: values
                  }
                }
              },
              required: [fieldId]
            }
          },
          required: ['$form']
        }),
      equalTo: (value: string) =>
        addCondition({
          type: 'object',
          properties: {
            $form: {
              type: 'object',
              properties: {
                [fieldId]: {
                  type: 'string',
                  not: {
                    const: value
                  }
                }
              },
              required: [fieldId]
            }
          },
          required: ['$form']
        })
    },
    or: (callback: (field: FieldAPI) => FieldAPI) => {
      const nestedConditions = callback(field(fieldId))._apply()

      return addCondition(ensureWrapper(nestedConditions, 'or'))
    },
    _apply: () => conditions,
    apply: () => {
      if (conditions.length === 1) {
        return defineConditional(conditions[0])
      }

      return defineConditional(ensureWrapper(conditions, 'and'))
    }
  }

  return api
}

type BooleanConnector = 'and' | 'or'

/**
 * Makes sure JSON Schema conditions are wrapped in an object with a $form property.
 */
const ensureWrapper = (
  conditions: AjvJSONSchema[],
  booleanConnector: BooleanConnector
): AjvJSONSchema => {
  const conditionsWithConnector = (
    conditions: AjvJSONSchema[],
    connector: BooleanConnector
  ): AjvJSONSchema =>
    connector === 'and'
      ? { type: 'object' as const, allOf: conditions, required: [] }
      : { type: 'object' as const, anyOf: conditions, required: [] }

  const needsWrapper = conditions.some(
    (condition) =>
      !(
        condition.type === 'object' &&
        condition.properties &&
        condition.properties.$form
      )
  )

  if (needsWrapper) {
    return {
      type: 'object',
      properties: {
        $form: {
          ...conditionsWithConnector(conditions, booleanConnector)
        }
      },
      required: []
    }
  }

  return conditionsWithConnector(conditions, booleanConnector)
}
