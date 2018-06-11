import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { Colors } from './Colors'

export const Header = styled.section`
  min-width: 100%;
  color: white;
  height: 80px;
  background: linear-gradient(
    270deg,
    ${Colors.headerGradientLight} 0%,
    ${Colors.headerGradientDark} 100%
  );
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  position: relative;
`
