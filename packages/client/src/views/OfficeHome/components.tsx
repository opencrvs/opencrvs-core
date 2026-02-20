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
import * as React from 'react'
import styled from 'styled-components'
import { Link } from '@opencrvs/components/lib/Link'

const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    align-items: flex-start;
  }
`

export const NameContainer = styled(Link)``
export const NoNameContainer = styled(Link).attrs({
  color: 'negative'
})``

interface IIconWith {
  status?: string
  name: React.ReactNode
  event?: string
  isDuplicate?: boolean
  isValidatedOnReview?: boolean
  isArchived?: boolean
}

export const IconWithNameEvent = ({}: IIconWith) => {
  return <Flex id="flex"></Flex>
}
