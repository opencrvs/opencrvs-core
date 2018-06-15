import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { FlexGrid } from './grid'

export const Nav = styled(FlexGrid)`
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.sm}px) {
    justify-content: inherit;
  }
`
