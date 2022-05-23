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
import styled from 'styled-components'

const SubSectionWrapper = styled.div`
  border-top: solid 1px ${({ theme }) => theme.colors.grey200};
  padding: 24px 0;
  flex-direction: row;
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h3};
  color: ${({ theme }) => theme.colors.copy};
`
const Optional = styled.span<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>`
  ${({ theme }) => theme.fonts.reg18};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.placeholderCopy};
  flex-grow: 0;
`

export interface ISubSectionProps {
  label: string
  required?: boolean
  optionalLabel: string
  disabled?: boolean
}

export class SubSectionDivider extends React.Component<ISubSectionProps> {
  render() {
    const { label, required, optionalLabel } = this.props
    return (
      <SubSectionWrapper>
        <Title>{label}</Title>
        {required === false && (
          <Optional disabled={this.props.disabled}>
            &nbsp;&nbsp;•&nbsp;{optionalLabel}
          </Optional>
        )}
      </SubSectionWrapper>
    )
  }
}
