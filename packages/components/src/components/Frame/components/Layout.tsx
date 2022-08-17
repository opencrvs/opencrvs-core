import styled from 'styled-components'
import { Content } from '../../interface/Content'

export const Layout = styled.section<{ sideColumn?: boolean }>`
  display: grid;
  width: 100%;
  gap: 24px;
  grid-template-columns: 1fr auto;
  max-width: min(1140px, 100% - 24px - 24px);
  margin: 24px auto;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    max-width: 100%;
    gap: 0;
    margin: 0;
  }

  ${Content} {
    margin: 0;
    width: 100%;
    max-width: 100%;
  }
`
