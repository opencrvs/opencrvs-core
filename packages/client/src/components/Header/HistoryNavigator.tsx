/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import React from 'react'
import { Button } from '@opencrvs/components/lib/Button'
import { useHistory } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { getUserDetails } from '@client/profile/profileSelectors'
import {
  FIELD_AGENT_ROLES,
  NATL_ADMIN_ROLES,
  REGISTRAR_ROLES,
  SYS_ADMIN_ROLES
} from '@client/utils/constants'
import {
  HOME,
  PERFORMANCE_HOME,
  REGISTRAR_HOME
} from '@client/navigation/routes'
import { goBack, goForward } from '@client/navigation'
import { Icon } from '@opencrvs/components/lib/Icon'

export function HistoryNavigator({
  hideForward = false
}: {
  hideForward?: boolean
}) {
  const history = useHistory()
  const dispatch = useDispatch()
  const userDetails = useSelector(getUserDetails)
  const role = userDetails && userDetails.role
  const location = history.location.pathname
  const isLandingPage = () => {
    if (
      (FIELD_AGENT_ROLES.includes(role as string) && HOME.includes(location)) ||
      (NATL_ADMIN_ROLES.includes(role as string) &&
        PERFORMANCE_HOME.includes(location)) ||
      (SYS_ADMIN_ROLES.includes(role as string) &&
        PERFORMANCE_HOME.includes(location)) ||
      (REGISTRAR_ROLES.includes(role as string) &&
        REGISTRAR_HOME.includes(location))
    ) {
      return true
    } else {
      return false
    }
  }
  return (
    <div>
      <Button
        id="header-go-back-button"
        type="icon"
        size="medium"
        aria-label="Go back"
        disabled={
          (history.action === 'POP' || history.action === 'REPLACE') &&
          isLandingPage()
        }
        onClick={() => dispatch(goBack())}
      >
        <Icon color="currentColor" name="ArrowLeft" size="medium" />
      </Button>
      {!hideForward && (
        <Button
          type="icon"
          size="medium"
          aria-label="Go forward"
          disabled={history.action === 'PUSH' || history.action === 'REPLACE'}
          onClick={() => dispatch(goForward())}
        >
          <Icon color="currentColor" name="ArrowRight" size="medium" />
        </Button>
      )}
    </div>
  )
}
