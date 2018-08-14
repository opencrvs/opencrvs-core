import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'

export const Header = styled.section`
  display: flex;
  flex-direction: column;

  color: white;

  overflow: auto;
  background: linear-gradient(
    270deg,
    ${({ theme }) => theme.colors.headerGradientLight} 0%,
    ${({ theme }) => theme.colors.headerGradientDark} 100%
  );
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  position: relative;
`
