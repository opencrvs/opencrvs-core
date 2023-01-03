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

import styled from 'styled-components'
import { LinkButton } from '@opencrvs/components/lib/buttons'

export const FormWrapper = styled.form`
  position: relative;
  margin: auto;
  width: 100%;
  margin-bottom: 50px;
  margin-top: 64px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-top: 48px;
  }
`

export const ActionWrapper = styled.div`
  position: relative;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
`
export const LogoContainer = styled.div`
  flex-direction: row;
  display: flex;
  justify-content: center;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    & svg {
      transform: scale(0.8);
    }
  }
`

export const Title = styled.div`
  margin: auto;
  margin-top: 30px;
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  ${({ theme }) => theme.fonts.reg16};
`

export const StyledButton = styled(LinkButton)`
  color: ${({ theme }) => theme.colors.black};
  flex-direction: row;
  justify-content: center;
  text-decoration: none;
  margin: 10px ${({ theme }) => theme.grid.margin}px;
  ${({ theme }) => theme.fonts.reg16};

  :hover {
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.colors.secondary};
  }

  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.copy};
  }

  &:not([data-focus-visible-added]) {
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.colors.black};
  }

  &:active:not([data-focus-visible-added]):enabled {
    outline: none;
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.copy};
  }
`
export const StyledButtonWrapper = styled.div`
  display: inline-flex;
  justify-content: center;
`
export const FieldWrapper = styled.div`
  min-height: 6.5em;
`
export interface IProps {
  formId: string
  submissionError: boolean
  errorCode?: number
}

export const StyledH2 = styled.h2`
  ${({ theme }) => theme.fonts.h2};
  font-weight: 400;
  text-align: center;
  color: ${({ theme }) => theme.colors.grey600};
`
export const Container = styled.div`
  position: relative;
  height: auto;
  padding: 0px;
  margin: 0px auto;
  width: min(500px, 90%);
`
