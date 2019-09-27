import * as React from 'react'
import styled from 'styled-components'

export interface ISpinner {
  id: string
  baseColor?: string
  className?: string
  size?: number
}

const styledSpinner = styled.div.attrs<ISpinner>({})

const StyledSpinner = styledSpinner`
  width: ${({ size }) => (size ? `${size}px` : 'auto')};
  display:flex;
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
}`

export class Spinner extends React.Component<ISpinner> {
  render() {
    const { id, className, baseColor, size } = this.props
    return (
      <StyledSpinner
        id={id}
        className={className}
        baseColor={baseColor}
        size={size ? size : 48}
      >
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
        </svg>
      </StyledSpinner>
    )
  }
}
