import * as React from 'react'
import styled, { StyledFunction, withTheme } from 'styled-components'

import { IGrid } from '../grid'

export interface IBox extends React.HTMLAttributes<HTMLDivElement> {}

const Wrapper = styled.div.attrs<IBox>({})`
  padding: 24px;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: rgba(53, 67, 93, 0.32) 0px 2px 6px;
`

class Component extends React.Component<IBox & { theme: { grid: IGrid } }> {
  render() {
    const { id, title, children, className, theme } = this.props
    return (
      <Wrapper id={id} className={className}>
        {children}
      </Wrapper>
    )
  }
}

export const Box = withTheme(Component)
