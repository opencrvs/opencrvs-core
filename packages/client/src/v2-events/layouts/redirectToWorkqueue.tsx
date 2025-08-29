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
import { Loader } from '@opencrvs/components'
import { ROUTES } from '@client/v2-events/routes'
import { useHomePage } from '@client/hooks/useHomePage'
import { useCountryConfigWorkqueueConfigurations } from '../features/events/useCountryConfigWorkqueueConfigurations'

export const RedirectToWorkqueue = () => {
  const workqueues = useCountryConfigWorkqueueConfigurations()
  const navigate = useNavigate()
  const { path } = useHomePage()

  useEffect(() => {
    if (workqueues.length) {
      navigate(
        ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: workqueues[0].slug }),
        {
          replace: true
        }
      )
    } else {
      /**
       * Some users (e.g., National System Admin) might not have access to any workqueue.
       * In that case, redirect the user to the old site so that other v1 operations can be performed.
       */
      navigate(path, { replace: true })
    }
  }, [workqueues, navigate, path])

  return <Loader id="redirect_to_workqueue" />
}
