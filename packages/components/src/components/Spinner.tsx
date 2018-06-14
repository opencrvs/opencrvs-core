import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { colors } from './colors'

export interface ISpinner {
  baseColor?: string
}

const styledSpinner = styled.div.attrs<ISpinner>({})

const StyledSpinner = styledSpinner`
  font-size: 10px;
  text-indent: -9999em;
  width: 6em;
  height: 6em;
  border-radius: 50%;
  background: ${colors.accentGradientDark};
  background: -moz-linear-gradient(left, ${colors.accentGradientLight} 10%, ${colors.accentGradientDark} 42%);
  background: -webkit-linear-gradient(left, ${colors.accentGradientLight} 10%, ${colors.accentGradientDark} 42%);
  background: -o-linear-gradient(left, ${colors.accentGradientLight} 10%, ${colors.accentGradientDark} 42%);
  background: linear-gradient(to right, ${colors.accentGradientLight} 10%, ${colors.accentGradientDark} 42%);
  position: relative;
  -webkit-animation: load3 0.8s infinite linear;
  animation: load3 0.8s infinite linear;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  &:before {
    width: 50%;
    height: 50%;
    background: ${({ baseColor }) => (baseColor ? baseColor : '#FFFFFF')};
    border-radius: 100% 0 0 0;
    position: absolute;
    top: 0;
    left: 0;
    content: '';
  }
  &:after {
    background: ${({ baseColor }) => (baseColor ? baseColor : '#FFFFFF')};
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
}`

export class Spinner extends React.Component<ISpinner> {
  render() {
    return (
      <StyledSpinner />
    )
  }
}
