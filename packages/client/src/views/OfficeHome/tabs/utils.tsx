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
import styled from '@client/styledComponents'
import { COLUMNS, SORT_ORDER } from '@opencrvs/components/lib/interface'
import { IDynamicValues } from '@opencrvs/components/lib/interface/GridTable/types'
import { orderBy } from 'lodash'

const IconNameContainer = styled.div`
  display: flex;
  gap: 16px;
`

const NameContainer = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  ${({ theme }) => theme.fonts.bold16}
  width: 100%;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Error = styled.span`
  color: ${({ theme }) => theme.colors.negative};
`

export const getIconWithName = (status: React.ReactNode, name: string) => {
  return (
    <IconNameContainer>
      {status}
      {name ? (
        <NameContainer>{name}</NameContainer>
      ) : (
        <Error>No name provided</Error>
      )}
    </IconNameContainer>
  )
}
