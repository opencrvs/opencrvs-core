import * as React from 'react'
import styled from 'styled-components'

const TopBarWrapper = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 48px;
  background: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.shadows.mistyShadow};
  display: flex;
  overflow-x: auto;
  justify-content: flex-start;
  align-items: center;
`
export class TopBar extends React.Component<{ id?: string }> {
  render() {
    const { id, children } = this.props
    return <TopBarWrapper id={id || 'top-bar'}>{children}</TopBarWrapper>
  }
}
