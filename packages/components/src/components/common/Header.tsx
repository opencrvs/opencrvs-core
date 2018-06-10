import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { colors } from './global/colors'
import { grid, heights } from './global/layout'

export const Header = styled.section`
  min-width: 100%;
  color: white;
  height: ${heights.header}px;
  background: linear-gradient(
    270deg,
    ${colors.headerGradientLight} 0%,
    ${colors.headerGradientDark} 100%
  );
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  position: relative;
`
