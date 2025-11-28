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
import {
  EventIndex,
  WorkqueueActionsWithDefault,
  isMetaAction,
  getOrThrow,
  ActionTypes
} from '@opencrvs/commons/client'
import { Button } from '@opencrvs/components'
import { useAuthentication } from '@client/utils/userUtils'
import { useAllowedActionConfigurations } from '../../workqueues/EventOverview/components/useAllowedActionConfigurations'
import { withSuspense } from '../../../components/withSuspense'

// Actions which should never be shown as a CTA
const EXCLUDED_ACTIONS: string[] = [
  ActionTypes.enum.ARCHIVE,
  ActionTypes.enum.CUSTOM
]

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

  const [, allowedActionConfigs] = useAllowedActionConfigurations(event, auth)

  const config =
    actionType === 'DEFAULT'
      ? allowedActionConfigs.find(({ type }) => !isMetaAction(type))
      : // If action type is not allowed, we don't provide it.
        allowedActionConfigs.find((item) => item.type === actionType)

  if (!config || EXCLUDED_ACTIONS.includes(config.type)) {
    return null
  }

  return (
    <Button
      disabled={'disabled' in config && Boolean(config.disabled)}
      type="primary"
      onClick={async () =>
        config.onCtaClick
          ? config.onCtaClick(redirectParam)
          : config.onClick(redirectParam)
      }
    >
      {intl.formatMessage(config.ctaLabel || config.label)}
    </Button>
  )
}

export const ActionCta = withSuspense(ActionCtaComponent)
