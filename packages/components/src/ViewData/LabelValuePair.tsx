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

const Label = styled.span`
  ${({ theme }) => theme.fonts.h4}
`
const Value = styled.span`
  ${({ theme }) => theme.fonts.reg18}
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const LabelValuePairContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  @media (max-width: 768px) {
    display: grid;
  }
`
interface IInfo {
  label: string
  value: string
}

export function LabelValuePair({ label, value }: IInfo) {
  return (
    <LabelValuePairContainer>
      <Label>{label}: </Label>
      <Value>{value}</Value>
    </LabelValuePairContainer>
  )
}
