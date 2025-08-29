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
import { useSelector } from 'react-redux'
import {
  hasDraftWorkqueue,
  hasOutboxWorkqueue,
  WORKQUEUE_DRAFT,
  WORKQUEUE_OUTBOX
} from '@client/v2-events/utils'
import { getScope } from '@client/profile/profileSelectors'
import { useCountryConfigWorkqueueConfigurations } from './useCountryConfigWorkqueueConfigurations'

/**
 * @returns a list of workqueue configurations including the core ones
 */
export function useAllWorkqueueConfigurations() {
  const scopes = useSelector(getScope)
  const countryConfigWorkqueues = useCountryConfigWorkqueueConfigurations()
  const coreWorkqueues = [WORKQUEUE_DRAFT, WORKQUEUE_OUTBOX].filter((w) => {
    if (w.name === WORKQUEUE_DRAFT.name) {
      return hasDraftWorkqueue(scopes ?? [])
    } else if (w.name === WORKQUEUE_OUTBOX.name) {
      return hasOutboxWorkqueue(scopes ?? [])
    }
    return false
  })

  return [...countryConfigWorkqueues, ...coreWorkqueues]
}
