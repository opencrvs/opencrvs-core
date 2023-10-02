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

const StyledInputDescriptor = styled.p`
  ${({ theme }) => theme.fonts.reg18};
  color: ${({ theme }) => theme.colors.supportingCopy};
  width: 100%;
  margin-bottom: 5px;
  display: inline-block;
`

export class InputDescriptor extends React.Component<
  { children?: React.ReactNode },
  {}
> {
  render() {
    return <StyledInputDescriptor>{this.props.children}</StyledInputDescriptor>
  }
}
