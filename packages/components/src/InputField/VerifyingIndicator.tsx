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
import styled, { withTheme } from 'styled-components'
import { ITheme } from '../theme'

const StyledSpan = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: row;
  align-items: center;

  & > svg {
    animation: spin 0.4s infinite linear;

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
`

interface IProps {
  theme: ITheme
}

class VerifyingIndicatorComponent extends React.Component<IProps> {
  render() {
    const { theme } = this.props

    return (
      <StyledSpan>
        <svg width="19px" height="19px" viewBox="0 0 19 19" version="1.1">
          <title>E31006E5-DA35-4DD9-96DD-EAD2A11925C4</title>
          <desc>Created with sketchtool.</desc>
          <defs>
            <linearGradient
              x1="59.6250641%"
              y1="93.3589824%"
              x2="7.74979653%"
              y2="18.2840722%"
              id="linearGradient-1"
            >
              <stop stopColor={theme.colors.primary} offset="0%" />
              <stop stopColor="#B0C8F1" stopOpacity="0" offset="100%" />
            </linearGradient>
          </defs>
          <g
            id="Page-1"
            stroke="none"
            strokeWidth="1"
            fill="none"
            fillRule="evenodd"
            strokeLinecap="round"
          >
            <g
              id="Interface/Forms"
              transform="translate(-379.000000, -2337.000000)"
              fillRule="nonzero"
              strokeWidth="2"
            >
              <g id="Group-6" transform="translate(380.000000, 2338.000000)">
                <g id="Group">
                  <path
                    d="M8.5,17 C13.1944204,17 17,13.1944204 17,8.5 C17,3.80557963 13.1944204,0 8.5,0"
                    id="Oval-Copy"
                    stroke={theme.colors.primary}
                  />
                  <path
                    d="M2.0169434,3.0024601 C0.758894363,4.48456433 0,6.40365753 0,8.5 C0,13.1944204 3.80557963,17 8.5,17"
                    id="Oval-Copy-2"
                    stroke="url(#linearGradient-1)"
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>
        &nbsp;Verifying...
      </StyledSpan>
    )
  }
}

export const VerifyingIndicator = withTheme(VerifyingIndicatorComponent)
