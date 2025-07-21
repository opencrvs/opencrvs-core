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
import { EventFieldId } from './AdvancedSearchConfig'
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
function eventFn(fieldId: EventFieldId) {
  return createEventFieldConfig(fieldId)
}

// Attach conditional helpers directly to the function
const event = Object.assign(eventFn, {
  /**
   * Creates a conditional that checks if the event contains a specific action type
   * with an optional template ID.
   *
   * @param templateId - The template ID to check for.
   */
  printActions: (templateId?: string) => {
    return {
      /**
       * Creates a conditional that checks if the event contains a specific action type
       * with a minimum count of occurrences.
       *
       * @param minCount - The minimum number of actions required.
       */
      minCount: (minCount: number) => {
        const actionProperties: Record<string, unknown> = {
          type: { const: ActionType.PRINT_CERTIFICATE }
        }
        const requiredFields = ['type']
        if (templateId) {
          actionProperties.templateId = { const: templateId }
          requiredFields.push('templateId')
        }
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
                  minContains: minCount
                }
              },
              required: ['actions']
            }
          },
          required: ['$event']
        })
      },
      /**
       * Builds a conditional that sets a maximum count for the number of print actions.
       * This is useful for limiting the number of print actions in a single event.
       */
      maxCount: (maxCount: number) => {
        const actionProperties: Record<string, unknown> = {
          type: { const: ActionType.PRINT_CERTIFICATE }
        }
        const requiredFields = ['type']
        if (templateId) {
          actionProperties.templateId = { const: templateId }
          requiredFields.push('templateId')
        }
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
                  maxContains: maxCount
                }
              },
              required: ['actions']
            }
          },
          required: ['$event']
        })
      }
    }
  },
  /**
   * Checks if the event contains a specific action type.
   * @param action - The action type to check for.
   */
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
    }),
  field(field: WorkqueueColumnKeys): WorkqueueColumnValue {
    return {
      $event: field
    }
  }
})

export { event }
