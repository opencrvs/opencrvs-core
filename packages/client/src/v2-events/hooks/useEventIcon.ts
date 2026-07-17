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
  EventConfig,
  EventIndex,
  resolveEventIcon
} from '@opencrvs/commons/client'
import { useValidatorContext } from './useValidatorContext'

/**
 * Resolves the icon configured for the event (`EventConfig.icon`), if any,
 * against the given event's current status/flags. Returns `undefined` when
 * no `icon` is configured or none of its conditionals match — callers should
 * fall back to a default icon in that case.
 */
export function useEventIcon(eventConfig: EventConfig, event: EventIndex) {
  const validatorContext = useValidatorContext()
  return resolveEventIcon(eventConfig.icon, event, validatorContext)
}
