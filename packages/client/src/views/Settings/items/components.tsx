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
import styled from 'styled-components'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'

export const LabelContainer = styled.span`
  ${({ theme }) => theme.fonts.bold16}
`

export const ValueContainer = styled.span`
  ${({ theme }) => theme.fonts.reg16}
`
export const DynamicHeightLinkButton = styled(LinkButton)`
  height: auto;
`

export const Message = styled.div`
  margin-bottom: 16px;
`
export const Label = styled.label`
  margin-bottom: 8px;
`
export const TopAlignedListViewItemSimplified = styled(ListViewItemSimplified)`
  align-items: start;
  padding: 16px 0;
`
