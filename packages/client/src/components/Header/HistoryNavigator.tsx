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
import React from 'react'
import { Button } from '@opencrvs/components/lib/Button'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { useSelector } from 'react-redux'
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
import { Icon } from '@opencrvs/components/lib/Icon'

export function HistoryNavigator({
  hideForward = false
}: {
  hideForward?: boolean
}) {
  const userDetails = useSelector(getUserDetails)
  const role = userDetails && userDetails.systemRole
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()

  const navigationType = useNavigationType()

  const isLandingPage = () => {
    if (
      (FIELD_AGENT_ROLES.includes(role as string) && HOME.includes(pathname)) ||
      (NATL_ADMIN_ROLES.includes(role as string) &&
        PERFORMANCE_HOME.includes(pathname)) ||
      (SYS_ADMIN_ROLES.includes(role as string) &&
        PERFORMANCE_HOME.includes(pathname)) ||
      (REGISTRAR_ROLES.includes(role as string) &&
        REGISTRAR_HOME.includes(pathname))
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
        disabled={
          (navigationType === 'POP' || navigationType === 'REPLACE') &&
          isLandingPage()
        }
        onClick={() => navigate(-1)}
      >
        <Icon name="ArrowLeft" />
      </Button>
      {!hideForward && (
        <Button
          type="icon"
          size="medium"
          disabled={navigationType === 'PUSH' || navigationType === 'REPLACE'}
          onClick={() => navigate(1)}
        >
          <Icon name="ArrowRight" />
        </Button>
      )}
    </div>
  )
}
