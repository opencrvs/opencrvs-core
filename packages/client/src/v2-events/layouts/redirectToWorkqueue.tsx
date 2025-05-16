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

import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Scope } from '@opencrvs/commons/client'
import { getScope } from '@client/profile/profileSelectors'
import { ROUTES } from '@client/v2-events/routes'
import { useWorkqueueConfigurations } from '../features/events/useWorkqueueConfiguration'

export const RedirectToWorkqueue = () => {
  const workqueues = useWorkqueueConfigurations()
  const scopes = useSelector(getScope)
  const navigate = useNavigate()

  useEffect(() => {
    const firstWorkqueue = workqueues.find(({ slug }) =>
      scopes?.includes(`workqueues.${slug}` as Scope)
    )

    if (firstWorkqueue) {
      navigate(
        ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: firstWorkqueue.slug })
      )
    }
  }, [workqueues, scopes, navigate])

  return <div>{'Loading...'}</div>
}
