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
import styled from 'styled-components'
import { defineMessage, useIntl } from 'react-intl'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Text } from '@opencrvs/components'
import { ActionType, ActionStatus } from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { roleMessage } from '@client/v2-events/features/workqueues/EventOverview/components/EventHistory/EventHistory'

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.orangeDarker};
  padding: 8px 20px;
  align-items: center;
`

const StyledText = styled(Text)`
  margin-left: 8px;
`

const message = defineMessage({
  id: 'editPageBanner.message',
  defaultMessage:
    'You are editing a record declared by TODO ({role} at {location})',
  description: 'The message for the edit page banner'
})

export function EditPageBanner() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.EDIT.PAGES)
  const intl = useIntl()
  const events = useEvents()
  const event = events.getEvent.getFromCache(eventId)
  const { getUser } = useUsers()
  const users = getUser.getAllCached()

  const { getLocations } = useLocations()
  const locations = getLocations.useSuspenseQuery()

  const declarationActions = event.actions.filter(
    (a) => a.type === ActionType.DECLARE && a.status === ActionStatus.Accepted
  )

  // Fetch createdAtLocation and createdBy from latest declaration action
  const { createdAtLocation, createdBy } =
    declarationActions[declarationActions.length - 1]

  const user = users.find((u) => u.id === createdBy)

  const location = createdAtLocation
    ? locations.get(createdAtLocation)
    : undefined

  const role = intl.formatMessage(roleMessage, { role: user?.role })

  // @TODO CIHAN: get user name
  return (
    <Wrapper>
      <Icon name="PencilSimpleLine" size="small" />
      <StyledText color="white" element="span" variant="bold14">
        {intl.formatMessage(message, { location: location?.name, role })}
      </StyledText>
    </Wrapper>
  )
}
