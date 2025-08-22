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

import { defineConditional } from '../conditionals/conditionals'
import { createEventFieldConfig } from '../event-config/event-configuration'
import { ActionType } from './ActionType'
import { EventFieldIdInput } from './AdvancedSearchConfig'
import {
  WorkqueueColumnKeys,
  WorkqueueColumnValue
} from './WorkqueueColumnConfig'

/**
 * Creates a function that acts like a callable + static method container.
 *
 * @example
 * event('status') // → returns search config
 * event.hasAction('CLICKED') // → returns conditional
 */
function eventFn(fieldId: EventFieldIdInput) {
  return createEventFieldConfig(fieldId)
}

// Attach conditional helpers directly to the function
const event = Object.assign(eventFn, {
  /**
   * Checks if the event contains a specific action type.
   * Can be used directly as a conditional or chained with additional methods.
   * @param action - The action type to check for.
   */
  hasAction: (action: ActionType) => {
    const basicConditional = defineConditional({
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

    const buildActionConstraints = (
      additionalFields?: Record<string, unknown>
    ) => {
      const actionProperties: Record<string, unknown> = {
        type: { const: action }
      }
      const requiredFields = ['type']

      if (additionalFields) {
        Object.entries(additionalFields).forEach(([key, value]) => {
          actionProperties[key] = { const: value }
          requiredFields.push(key)
        })
      }

      return { actionProperties, requiredFields }
    }

    const createCountConditional = (
      countType: 'minContains' | 'maxContains',
      count: number,
      additionalFields?: Record<string, unknown>
    ) => {
      const { actionProperties, requiredFields } =
        buildActionConstraints(additionalFields)

      return defineConditional({
        type: 'object',
        properties: {
          $event: {
            type: 'object',
            properties: {
              actions: {
                type: 'array',
                contains: {
                  type: 'object',
                  properties: actionProperties,
                  required: requiredFields
                },
                [countType]: count
              }
            },
            required: ['actions']
          }
        },
        required: ['$event']
      })
    }

    const withMinMax = (additionalFields?: Record<string, unknown>) => {
      return {
        /**
         * Creates a conditional that checks if the event contains a specific action type
         * with a minimum count of occurrences.
         *
         * @param minCount - The minimum number of actions required.
         */
        minCount: (minCount: number) =>
          createCountConditional('minContains', minCount, additionalFields),

        /**
         * Builds a conditional that sets a maximum count for the number of actions.
         * This is useful for limiting the number of actions of a specific type in a single event.
         */
        maxCount: (maxCount: number) =>
          createCountConditional('maxContains', maxCount, additionalFields)
      }
    }

    const chainableMethods = {
      /**
       * Adds additional field constraints to the action matching.
       *
       * @param fields - Object containing additional fields to match on the action.
       */
      withFields: (fields: Record<string, unknown>) => withMinMax(fields),

      /**
       * Adds template ID constraint to the action matching.
       * This is a convenience method that adds content.templateId to the fields.
       *
       * @param id - The template ID to match against.
       */
      withTemplate: (id: string) =>
        withMinMax({
          content: { templateId: id }
        }),
      ...withMinMax()
    }

    return { ...basicConditional, ...chainableMethods }
  },
  field(field: WorkqueueColumnKeys): WorkqueueColumnValue {
    return {
      $event: field
    }
  }
})

export { event }
