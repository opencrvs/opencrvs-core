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
import styled from '@client/styledComponents'
import { useIntl } from 'react-intl'
import { constantsMessages } from '@client/i18n/messages'
import { Event } from '@client/forms'

const Label = styled.span`
  ${({ theme }) => theme.fonts.bold16};
`

export const Value = styled.span`
  color: ${({ theme }) => theme.colors.grey500};
`

export function DraftVersion({
  event,
  version
}: {
  event: Event
  version: number
}) {
  const intl = useIntl()
  return (
    <Label>{`${intl.formatMessage(
      constantsMessages[event]
    )} v${version}`}</Label>
  )
}
