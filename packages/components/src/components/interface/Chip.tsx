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
import React from 'react'

interface IProps {
  status: JSX.Element
  text: string
}

const StyledStatus = styled.span`
  ${({ theme }) => theme.fonts.bold16};
  background-color: rgba(150, 150, 150, 0.1);
  border-radius: 17px;
  padding: 5px 10px 5px 7px;
  margin: 2px 5px 2px 0;
  display: flex;
  align-items: center;
  height: 32px;
  & span {
    color: ${({ theme }) => theme.colors.supportingCopy};
    text-transform: uppercase;
    margin-left: 5px;
  }
`

export class Chip extends React.Component<IProps> {
  render() {
    return (
      <StyledStatus>
        {this.props.status}
        <span>{this.props.text}</span>
      </StyledStatus>
    )
  }
}
