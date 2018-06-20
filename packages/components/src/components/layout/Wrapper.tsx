import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { grid } from '../grid'

export const Wrapper = styled.div`
  margin: auto;
  max-width: : ${({ theme }) => theme.grid.breakpoints.lg}px;
`
