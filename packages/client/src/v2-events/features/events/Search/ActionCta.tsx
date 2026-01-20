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
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import {
  EventIndex,
  WorkqueueActionsWithDefault,
  isMetaAction,
  getOrThrow,
  ActionType
} from '@opencrvs/commons/client'
import { Button } from '@opencrvs/components'
import { useAuthentication } from '@client/utils/userUtils'
import { ROUTES } from '@client/v2-events/routes'
import {
  useAllowedActionConfigurations,
  reviewLabel
} from '../../workqueues/EventOverview/components/useAllowedActionConfigurations'
import { withSuspense } from '../../../components/withSuspense'

/**
 * @returns next available action cta based on the given event.
 */
function ActionCtaComponent({
  event,
  actionType,
  redirectParam
}: {
  event: EventIndex
  actionType: WorkqueueActionsWithDefault
  redirectParam?: string
}) {
  const intl = useIntl()
  const maybeAuth = useAuthentication()
  const auth = getOrThrow(
    maybeAuth,
    'Authentication is not available but is required'
  )
  const navigate = useNavigate()

  const [, allowedActionConfigs] = useAllowedActionConfigurations(event, auth)

  const config =
    actionType === 'DEFAULT'
      ? allowedActionConfigs.find(({ type }) => !isMetaAction(type))
      : // If action type is not allowed, we don't provide it.
        allowedActionConfigs.find((item) => item.type === actionType)

  if (!config || actionType === ActionType.READ || config.reviewOnCta) {
    return (
      <Button
        type="primary"
        onClick={() => {
          navigate(
            ROUTES.V2.EVENTS.EVENT.RECORD.buildPath(
              { eventId: event.id },
              { workqueue: redirectParam }
            )
          )
        }}
      >
        {intl.formatMessage(reviewLabel)}
      </Button>
    )
  }

  return (
    <Button
      disabled={'disabled' in config && Boolean(config.disabled)}
      type="primary"
      onClick={async () => config.onClick(redirectParam)}
    >
      {intl.formatMessage(config.label)}
    </Button>
  )
}

export const ActionCta = withSuspense(ActionCtaComponent)
