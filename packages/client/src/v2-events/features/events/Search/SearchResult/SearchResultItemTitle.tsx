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
import { EventConfig, EventIndex } from '@opencrvs/commons/client'
import { useEventTitle } from '../../useEvents/useEventTitle'

/*
 * The workqueue row is the click and keyboard target for opening a record,
 * so the title renders as plain text. Fallback titles stay red to signal
 * the record is missing a name.
 */
const FallbackTitle = styled.span`
  color: ${({ theme }) => theme.colors.red};
`

export function SearchResultItemTitle({
  event,
  eventConfig
}: {
  event: EventIndex
  eventConfig: EventConfig
}) {
  const { getEventTitle } = useEventTitle()
  const { title, useFallbackTitle } = getEventTitle(eventConfig, event)

  if (useFallbackTitle) {
    return <FallbackTitle>{title}</FallbackTitle>
  }

  return <>{title}</>
}
