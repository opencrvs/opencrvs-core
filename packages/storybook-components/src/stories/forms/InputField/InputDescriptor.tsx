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

const StyledInputDescriptor = styled.p`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  color: ${({ theme }) => theme.colors.placeholder};
  width: 100%;
  margin-bottom: 5px;
  display: inline-block;
`

export class InputDescriptor extends React.Component<{}, {}> {
  render() {
    return <StyledInputDescriptor>{this.props.children}</StyledInputDescriptor>
  }
}
