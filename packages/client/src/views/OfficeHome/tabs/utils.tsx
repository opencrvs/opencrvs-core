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
import * as React from 'react'
import {
  WORKQUEUE_TABS,
  IWORKQUEUE_TABS
} from '@client/components/interface/Navigation'
import { DeclarationIcon } from '@opencrvs/components/lib/icons'
import styled from '@client/styledComponents'

const IconNameContainer = styled.div`
  display: flex;
  gap: 16px;
`

const NameContainer = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  ${({ theme }) => theme.fonts.bold16}
`

export const getIconName = (status: IWORKQUEUE_TABS, name: string) => {
  let icon: React.ReactNode
  switch (status) {
    case WORKQUEUE_TABS.sentForReview:
      icon = <DeclarationIcon color="orange" />
      break
    default:
      icon = <DeclarationIcon />
  }
  return (
    <IconNameContainer>
      {icon}
      <NameContainer>{name}</NameContainer>
    </IconNameContainer>
  )
}
