import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { grid } from './global/layout'

export const Page = styled.div`
  display: flex;
  min-width: ${grid.minWidth}px;
  flex-direction: column;
`
