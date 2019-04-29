import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'

export const Header = styled.section`
  display: flex;
  flex-direction: column;

  color: ${({ theme }: any) => theme.colors.white};

  overflow: visible;
  background: linear-gradient(
    270deg,
    ${({ theme }: any) => theme.colors.headerGradientLight} 0%,
    ${({ theme }: any) => theme.colors.headerGradientDark} 100%
  );
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  position: relative;
`
