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
import { lightColors } from '../semantics'

const SubSectionWrapper = styled.div`
  border-top: solid 1px ${lightColors['border/default']};
  padding: 24px 0;
  flex-direction: row;
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h3};
  color: ${lightColors['text/primary']};
`
const Optional = styled.span<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>`
  ${({ theme }) => theme.fonts.reg18};
  color: ${({ disabled }) =>
    disabled ? lightColors['text/disabled'] : lightColors['text/tertiary']};
  flex-grow: 0;
`

export interface ISubSectionProps {
  label: string
  required?: boolean
  optionalLabel: string
  disabled?: boolean
}

export const SubSectionDivider = ({
  label,
  required,
  optionalLabel,
  disabled
}: ISubSectionProps) => (
  <SubSectionWrapper>
    <Title>{label}</Title>
    {required === false && (
      <Optional disabled={disabled}>
        &nbsp;&nbsp;•&nbsp;{optionalLabel}
      </Optional>
    )}
  </SubSectionWrapper>
)
