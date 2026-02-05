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
import styled from 'styled-components'
import {
  EventIndex,
  CtaActionType,
  getOrThrow,
  ActionType
} from '@opencrvs/commons/client'
import { Button } from '@opencrvs/components'
import { useAuthentication } from '@client/utils/userUtils'
import { ROUTES } from '@client/v2-events/routes'
import { useAllowedActionConfigurations } from '../../workqueues/EventOverview/components/useAllowedActionConfigurations'
import { withSuspense } from '../../../components/withSuspense'

const StyledButton = styled(Button)`
  max-width: 150px;
  overflow: hidden;
  white-space: nowrap;
  display: block;
  text-overflow: ellipsis;
`

const reviewLabel = {
  id: 'buttons.review',
  defaultMessage: 'Review',
  description: 'Label for review CTA button'
}

/**
 * @returns next available action cta based on the given event.
 */
function ActionCtaComponent({
  event,
  actionType,
  redirectParam
}: {
  event: EventIndex
  actionType: CtaActionType
  redirectParam?: string
}) {
  console.log(`ActionCta rendering for event ${event.id}, action ${actionType}`)
  const intl = useIntl()
  const maybeAuth = useAuthentication()
  const auth = getOrThrow(
    maybeAuth,
    'Authentication is not available but is required'
  )
  const navigate = useNavigate()

  console.log(
    `ActionCta Calling useAllowedActionConfigurations for event ${event.id}`
  )
  const [, allowedActionConfigs] = useAllowedActionConfigurations(event, auth)
  const config = allowedActionConfigs.find((item) => item.type === actionType)

  if (!config || actionType === ActionType.READ) {
    return (
      <StyledButton
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
      </StyledButton>
    )
  }

  return (
    <StyledButton
      disabled={'disabled' in config && Boolean(config.disabled)}
      type="primary"
      onClick={async () => config.onClick(redirectParam)}
    >
      {intl.formatMessage(config.label)}
    </StyledButton>
  )
}

export const ActionCta = withSuspense(ActionCtaComponent)
