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

type DateBoundary = {
  now: () => FieldAPI
  date: (
    // date should be in yyyy-mm-dd format
    date: `${number}${number}${number}${number}-${number}${number}-${number}${number}`
  ) => FieldAPI
  days: (days: number) => {
    inPast: () => FieldAPI
    inFuture: () => FieldAPI
  }
}

export type FieldAPI = {
  inArray: (values: string[]) => FieldAPI
  /**
   * Checks if the date is within `days` days in the past from now.
   */
  isBefore: () => DateBoundary
  isAfter: () => DateBoundary
  isEqualTo: (value: string) => FieldAPI
  isUndefined: () => FieldAPI
  not: {
    isBefore: () => DateBoundary
    isAfter: () => DateBoundary
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

  const getNegativeDateRange = (
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
            not: {
              format: 'date',
              [clause]: date
            }
          }
        },
        required: [fieldId]
      }
    },
    required: ['$form']
  })

  const api: FieldAPI = {
    isAfter: () => ({
      days: (days: number) => ({
        inPast: () =>
          addCondition(getDateRange(getDateFromNow(days), 'formatMinimum')),
        inFuture: () =>
          addCondition(getDateRange(getDateFromNow(-days), 'formatMinimum'))
      }),
      date: (date: string) => addCondition(getDateRange(date, 'formatMinimum')),
      now: () => addCondition(getDateRange(getDateFromNow(0), 'formatMinimum'))
    }),
    isBefore: () => ({
      days: (days: number) => ({
        inPast: () =>
          addCondition(getDateRange(getDateFromNow(days), 'formatMaximum')),
        inFuture: () =>
          addCondition(getDateRange(getDateFromNow(-days), 'formatMaximum'))
      }),
      date: (date: string) => addCondition(getDateRange(date, 'formatMaximum')),
      now: () => addCondition(getDateRange(getDateFromNow(0), 'formatMaximum'))
    }),
    isEqualTo: (value: string) =>
      addCondition({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
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
            }
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
                enum: values
              }
            },
            required: [fieldId]
          }
        },
        required: ['$form']
      }),
    not: {
      isAfter: () => ({
        days: (days: number) => ({
          inPast: () =>
            addCondition(
              getNegativeDateRange(getDateFromNow(days), 'formatMinimum')
            ),
          inFuture: () =>
            addCondition(
              getNegativeDateRange(getDateFromNow(-days), 'formatMinimum')
            )
        }),
        date: (date: string) =>
          addCondition(getNegativeDateRange(date, 'formatMinimum')),
        now: () =>
          addCondition(getNegativeDateRange(getDateFromNow(0), 'formatMinimum'))
      }),
      isBefore: () => ({
        days: (days: number) => ({
          inPast: () =>
            addCondition(
              getNegativeDateRange(getDateFromNow(days), 'formatMaximum')
            ),
          inFuture: () =>
            addCondition(
              getNegativeDateRange(getDateFromNow(-days), 'formatMaximum')
            )
        }),
        date: (date: string) =>
          addCondition(getNegativeDateRange(date, 'formatMaximum')),
        now: () =>
          addCondition(getNegativeDateRange(getDateFromNow(0), 'formatMaximum'))
      }),
      inArray: (values: string[]) =>
        addCondition({
          type: 'object',
          properties: {
            $form: {
              type: 'object',
              properties: {
                [fieldId]: {
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
        return conditions[0]
      }

      return ensureWrapper(conditions, 'and')
    }
  }

  return api
}

type BooleanConnector = 'and' | 'or'

/**
 * Makes sure JSON Schema conditions are wrapped in an object with a $form property.
 */
const ensureWrapper = (
  conditions: JSONSchema[],
  booleanConnector: BooleanConnector
) => {
  const conditionsWithConnector = (
    conditions: JSONSchema[],
    connector: BooleanConnector
  ) => (connector === 'and' ? { allOf: conditions } : { anyOf: conditions })

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
          type: 'object',
          ...conditionsWithConnector(conditions, booleanConnector)
        }
      }
    }
  }

  return conditionsWithConnector(conditions, booleanConnector)
}
