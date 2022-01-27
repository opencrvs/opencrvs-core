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

export interface ISpinner {
  id: string
  baseColor?: string
  className?: string
  size?: number
  downloadingApplication?: boolean
}

const StyledSpinner = styled.div<ISpinner>`
  width: ${({ size }) => (size ? `${size}px` : 'auto')};
  display: flex;
  justify-content: center;
  & svg {
    animation: rotate 2s linear infinite;
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;

    & circle {
      stroke: ${({ baseColor }) =>
        baseColor ? baseColor : ({ theme }) => theme.colors.primary};
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }
  }

  ${({ downloadingApplication }) =>
    downloadingApplication && `margin-left: auto;`}

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
`

export class Spinner extends React.Component<ISpinner> {
  render() {
    const { id, className, baseColor, size, downloadingApplication } =
      this.props
    return (
      <StyledSpinner
        id={id}
        className={className}
        baseColor={baseColor}
        size={size ? size : 48}
        downloadingApplication={downloadingApplication}
      >
        {downloadingApplication ? (
          <svg viewBox="0 0 24 24">
            <path
              d="M1 4V10H7"
              stroke="#4972BB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23 20V14H17"
              stroke="#4972BB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.5473 9.3336C19.7315 9.85425 20.3029 10.127 20.8236 9.94272C21.3442 9.75848 21.617 9.18705 21.4327 8.66641L19.5473 9.3336ZM5.64 5.64L6.32478 6.36875C6.33239 6.3616 6.3399 6.35432 6.34728 6.34693L5.64 5.64ZM0.315223 9.27125C-0.0872558 9.64944 -0.106945 10.2823 0.271247 10.6848C0.649439 11.0873 1.2823 11.1069 1.68478 10.7288L0.315223 9.27125ZM23.694 14.7199C24.0916 14.3365 24.1032 13.7035 23.7198 13.3059C23.3365 12.9083 22.7034 12.8968 22.3058 13.2801L23.694 14.7199ZM18.4766 18.3614L17.7825 17.6415C17.775 17.6487 17.7676 17.6561 17.7603 17.6636L18.4766 18.3614ZM4.9453 14.6743C4.76525 14.1522 4.19603 13.8749 3.67392 14.055C3.15181 14.235 2.87452 14.8042 3.05458 15.3263L4.9453 14.6743ZM21.4327 8.66641C20.2873 5.42953 17.5613 3.00665 14.2124 2.24891L13.771 4.19961C16.4502 4.80579 18.6309 6.7441 19.5473 9.3336L21.4327 8.66641ZM14.2124 2.24891C10.8635 1.49118 7.36 2.50457 4.93272 4.93307L6.34728 6.34693C8.28911 4.40413 11.0919 3.59342 13.771 4.19961L14.2124 2.24891ZM4.95522 4.91125L0.315223 9.27125L1.68478 10.7288L6.32478 6.36875L4.95522 4.91125ZM22.3058 13.2801L17.7825 17.6415L19.1707 19.0812L23.694 14.7199L22.3058 13.2801ZM17.7603 17.6636C15.8712 19.6029 13.1534 20.4057 10.561 19.8038L10.1087 21.752C13.3927 22.5144 16.8227 21.4925 19.1929 19.0591L17.7603 17.6636ZM10.561 19.8038C7.96691 19.2015 5.84104 17.2717 4.9453 14.6743L3.05458 15.3263C4.16877 18.5572 6.8263 20.9899 10.1087 21.752L10.561 19.8038Z"
              fill="#4972BB"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
          </svg>
        )}
      </StyledSpinner>
    )
  }
}
