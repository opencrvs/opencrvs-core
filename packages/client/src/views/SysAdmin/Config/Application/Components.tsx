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
import { Text } from '@opencrvs/components/lib/Text'
import styled from 'styled-components'
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { TextInput } from '@opencrvs/components/lib/TextInput'

export const Content = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`
export const Field = styled.div`
  width: 100%;
  margin-bottom: 30px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-bottom: 0px;
  }
`
export const HalfWidthInput = styled(TextInput)`
  width: 300px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
export const SmallWidthInput = styled(TextInput)`
  width: 78px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`

export const InputContainer = styled.div`
  display: flex;
  margin-top: 30px;
  justify-content: center;
  align-items: center;
  gap: 8px;
`

export const CancelButton = styled(TertiaryButton)`
  height: 40px;
  & div {
    padding: 0;
  }
`

export const ApplyButton = styled(PrimaryButton)`
  height: 40px;
  & div {
    padding: 0 8px;
  }
`
export const ErrorContent = styled.div`
  display: flex;
  margin-bottom: 10px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`

export const ErrorMessage = styled.div`
  position: relative;
  color: ${({ theme }) => theme.colors.negative};
  margin-left: 6px;
`

export const Message = styled.div`
  margin-bottom: 16px;
`

export const Label = styled(Text).attrs({
  variant: 'bold16',
  element: 'span'
})``
export const Value = styled(Text).attrs({ variant: 'reg16', element: 'span' })``
