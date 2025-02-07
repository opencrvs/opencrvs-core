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

import { ITokenPayload } from '../authentication'
import { ActionDocument, ActionFormData } from '../events/ActionDocument'
import { EventDocument } from '../events/EventDocument'

import { PartialSchema as AjvJSONSchemaType } from 'ajv/dist/types/json-schema'

/** @knipignore */
export type JSONSchema = {
  readonly __nominal__type: 'JSONSchema'
}

export function defineConditional(schema: any) {
  return schema as JSONSchema
}

export type ConditionalParameters = { $now: string } & (
  | {
      $event: EventDocument
    }
  | {
      $event: EventDocument
      $form: ActionFormData
      $user: ITokenPayload
    }
  | {
      $form: ActionFormData
    }
)

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type AjvJSONSchema = AjvJSONSchemaType<
  UnionToIntersection<ConditionalParameters>
>

export function trueConstant(): AjvJSONSchema {
  return {}
}

export function and(...conditions: AjvJSONSchema[]): AjvJSONSchema {
  return {
    type: 'object',
    allOf: conditions,
    required: []
  }
}

export function or(...conditions: AjvJSONSchema[]): AjvJSONSchema {
  return {
    type: 'object',
    anyOf: conditions,
    required: []
  }
}

export function not(condition: AjvJSONSchema): AjvJSONSchema {
  return {
    type: 'object',
    not: condition,
    required: []
  }
}

export function userHasScope(scope: string): AjvJSONSchema {
  return {
    type: 'object',
    properties: {
      $user: {
        type: 'object',
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

export function eventHasAction(type: ActionDocument['type']): AjvJSONSchema {
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

export type FieldConditionalAPI = {
  inArray: (values: string[]) => FieldConditionalAPI
  isBeforeNow: () => FieldConditionalAPI
  isEqualTo: (value: string | boolean) => FieldConditionalAPI
  isUndefined: () => FieldConditionalAPI
  not: {
    inArray: (values: string[]) => FieldConditionalAPI
    equalTo: (value: string | boolean) => FieldConditionalAPI
  }
  /**
   * joins multiple conditions with OR instead of AND.
   * @example field('fieldId').or((field) => field.isUndefined().not.inArray(['value1', 'value2'])).apply()
   */
  or: (
    callback: (field: FieldConditionalAPI) => FieldConditionalAPI
  ) => FieldConditionalAPI
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
 * @returns @see FieldConditionalAPI
 */
export function field(fieldId: string) {
  const conditions: AjvJSONSchema[] = []

  const addCondition = (rule: AjvJSONSchema) => {
    conditions.push(rule)
    return api
  }

  const api: FieldConditionalAPI = {
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
    isEqualTo: (value: string | boolean) =>
      addCondition({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                oneOf: [
                  { type: 'string', const: value },
                  { type: 'boolean', const: value }
                ]
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
      equalTo: (value: string | boolean) =>
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
    or: (callback: (field: FieldConditionalAPI) => FieldConditionalAPI) => {
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

export function objectHasProperty(
  property: string,
  type: 'string' | 'number' | 'boolean' | 'array' | 'object',
  format?: string
) {
  return {
    type: 'object',
    properties: {
      [property]: {
        type,
        format
      }
    },
    required: [property]
  }
}
