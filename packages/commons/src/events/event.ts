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

import { createEventConditionals } from '../conditionals/conditionals'
import { createEventFieldConfig } from '../event-config/event-configuration'
import { EventFieldId } from './AdvancedSearchConfig'
import { EventMetadata, EventMetadataParameter } from './EventMetadata'
import { SelectOption } from './FieldConfig'

/**
 * Creates a function that acts like a callable + static method container.
 *
 * @example
 * event('status') // → returns search config
 * event.hasAction('CLICKED') // → returns conditional
 */
function eventFn(fieldId: EventFieldId, options?: SelectOption[]) {
  return createEventFieldConfig(fieldId, options)
}

// Attach conditional helpers directly to the function
const event = Object.assign(eventFn, {
  ...createEventConditionals(),
  field(field: keyof EventMetadata): EventMetadataParameter {
    return {
      $event: field
    }
  }
})

export { event }
