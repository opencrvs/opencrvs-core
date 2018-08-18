import * as React from 'react'
import styled, { StyledFunction, withTheme } from 'styled-components'

import { IGrid } from '../grid'

export interface IBox extends React.HTMLAttributes<HTMLDivElement> {}

const Wrapper = styled.div.attrs<IBox>({})`
  padding: 25px;
  background: white;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
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
