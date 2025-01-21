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

import { JSONSchema } from '@opencrvs/commons/conditionals'
import { ActionDocument } from '@opencrvs/commons/events'

export * as deduplication from './deduplication'

export function defineConditional(conditional: JSONSchema): JSONSchema {
  return conditional
}

export function and(...conditions: JSONSchema[]): JSONSchema {
  return {
    type: 'object',
    allOf: conditions
  }
}

export function or(...conditions: JSONSchema[]): JSONSchema {
  return {
    type: 'object',
    anyOf: conditions
  }
}

export function not(condition: JSONSchema): JSONSchema {
  return {
    type: 'object',
    not: condition
  }
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

export function eventHasAction(type: ActionDocument['type']) {
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
  _apply: () => JSONSchema[]
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
  const conditions: JSONSchema[] = []

  const addCondition = (rule: JSONSchema) => {
    conditions.push(rule)
    return api
  }

  const api: FieldAPI = {
    isBeforeNow: () =>
      addCondition({
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
      }),
    isEqualTo: (value: string) =>
      addCondition({
        [fieldId]: {
          const: value
        }
      }),
    isUndefined: () =>
      addCondition({
        not: {
          type: 'object',
          required: [fieldId]
        }
      }),
    inArray: (values: string[]) =>
      addCondition({
        [fieldId]: {
          enum: values
        }
      }),
    not: {
      inArray: (values: string[]) =>
        addCondition({
          [fieldId]: {
            not: {
              enum: values
            }
          }
        }),
      equalTo: (value: string) =>
        addCondition({
          [fieldId]: {
            not: {
              const: value
            }
          }
        })
    },
    or: (callback: (field: FieldAPI) => FieldAPI) => {
      const nestedConditions = callback(field(fieldId))._apply()
      return addCondition({
        type: 'object',
        anyOf: nestedConditions
      })
    },
    _apply: () => conditions,
    apply: () => {
      if (conditions.length === 1) {
        return {
          type: 'object',
          properties: { $form: { properties: conditions[0] } },
          required: ['$form', fieldId]
        }
      }

      return { type: 'object', allOf: conditions, required: ['$form', fieldId] }
    }
  }

  return api
}
