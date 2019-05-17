import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'

export const Header = styled.section`
  display: flex;
  flex-direction: column;

  color: ${({ theme }) => theme.colors.white};

  overflow: visible;
  ${({ theme }) => theme.gradients.gradientNightshade};
  ${({ theme }) => theme.shadows.shadowMisty};
  position: relative;
`
