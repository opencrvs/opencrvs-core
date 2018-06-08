import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { grid } from './global/layout'

export const FlexWrapper = styled.div`
  margin: auto;
  max-width: ${grid.breakpoints.lg}px;
`

export const FlexGrid = styled.div`
  display: flex;
  flex-flow: row wrap;
`
