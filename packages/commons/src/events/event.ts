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
