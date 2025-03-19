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

import { createContext, useContext } from 'react'

import { EventIndex, EventConfig } from '@opencrvs/commons/client'

export const CurrentEventContext = createContext<{
  config: EventConfig | null
  event: EventIndex | null
}>({ config: null, event: null })

export function useCurrentEvent() {
  return useContext(CurrentEventContext)
}
