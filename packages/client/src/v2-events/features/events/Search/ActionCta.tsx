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
import styled from 'styled-components'
import { EventIndex, WorkqueueActionType } from '@opencrvs/commons/client'
import { Button } from '@opencrvs/components'
import { withSuspense } from '../../../components/withSuspense'
import { useGetWorkqueueActionConfiguration } from '../../workqueues/Actions/useGetActionConfiguration'

const StyledButton = styled(Button)`
  max-width: 150px;
  overflow: hidden;
  white-space: nowrap;
  display: block;
  text-overflow: ellipsis;
`

/**
 * Component rendering CTA button for an event in search result.
 *
 * @returns next available action cta based on the given event.
 */
function ActionCtaComponent({
  event,
  actionType,
  redirectParam
}: {
  event: EventIndex
  actionType: WorkqueueActionType
  redirectParam?: string
}) {
  const intl = useIntl()

  const config = useGetWorkqueueActionConfiguration(event, actionType)

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
