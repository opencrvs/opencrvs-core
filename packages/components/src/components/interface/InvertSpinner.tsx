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

export interface IInvertSpinner {
  id: string
  baseColor?: string
  className?: string
  size?: string
}

/* stylelint-disable opencrvs/no-font-styles */
const StyledSpinner = styled.div<IInvertSpinner>`
  font-size: 10px;
  text-indent: -9999em;
  width: ${({ size }) => (size ? size : '6em')};
  height: ${({ size }) => (size ? size : '6em')};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.white};
  /* stylelint-disable value-no-vendor-prefix */
  background: -moz-linear-gradient(
    left,
    ${({ theme }) => theme.colors.gradientLight} 10%,
    ${({ theme }) => theme.colors.white} 42%
  );
  background: -webkit-linear-gradient(
    left,
    ${({ theme }) => theme.colors.gradientLight} 10%,
    ${({ theme }) => theme.colors.white} 42%
  );
  background: -o-linear-gradient(
    left,
    ${({ theme }) => theme.colors.gradientLight} 10%,
    ${({ theme }) => theme.colors.white} 42%
  );
  background: linear-gradient(
    to right,
    ${({ theme }) => theme.colors.gradientLight} 10%,
    ${({ theme }) => theme.colors.white} 42%
  );
  position: relative;
  -webkit-animation: load3 0.4s infinite linear;
  animation: load3 0.4s infinite linear;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  &:before {
    width: 50%;
    height: 50%;
    background: ${({ baseColor }) => (baseColor ? baseColor : '#4C68C1')};
    border-radius: 100% 0 0 0;
    position: absolute;
    top: 0;
    left: 0;
    content: '';
  }
  &:after {
    background: ${({ baseColor }) => (baseColor ? baseColor : '#4C68C1')};
    width: 80%;
    height: 80%;
    border-radius: 50%;
    content: '';
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

  @-webkit-keyframes load3 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes load3 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
`

export class InvertSpinner extends React.Component<IInvertSpinner> {
  render() {
    const { children, id, className, baseColor, size } = this.props
    return (
      <StyledSpinner
        id={id}
        className={className}
        baseColor={baseColor}
        size={size}
      >
        {children}
      </StyledSpinner>
    )
  }
}
