import * as React from 'react'
import styled, { StyledComponentBase } from 'styled-components'
import { grid } from '../grid'

export const Page = styled.div`
  display: flex;
  min-width: ${grid.minWidth}px;
  flex-direction: column;
`
