import * as React from 'react'
import styled, { StyledComponentBase } from 'styled-components'

export const Link = styled.a<{ error?: boolean }>`
  width: auto;
  min-height: 44px;
  color: ${({ error, theme }) =>
    error ? theme.colors.error : theme.colors.copy};
  cursor: pointer;
  border: 0;
  text-decoration: underline;
  ${({ theme }) => theme.fonts.bodyStyle};
`
