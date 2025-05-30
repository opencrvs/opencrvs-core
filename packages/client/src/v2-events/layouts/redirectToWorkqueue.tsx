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
import { useNavigate } from 'react-router-dom'
import { findScope } from '@opencrvs/commons/client'
import { Loader } from '@opencrvs/components'
import { ROUTES } from '@client/v2-events/routes'
import { useWorkqueueConfigurations } from '../features/events/useWorkqueueConfiguration'

export const RedirectToWorkqueue = () => {
  const workqueues = useWorkqueueConfigurations()
  const navigate = useNavigate()

  useEffect(() => {
    if (workqueues.length) {
      navigate(
        ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: workqueues[0].slug })
      )
    } else {
      throw new Error('No workqueue is configured for this user')
    }
  }, [workqueues, navigate])

  return <Loader id="redirectToWorkqueue" />
}
