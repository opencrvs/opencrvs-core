import styled, { css } from 'styled-components'

const sideColumnLayout = css`
  display: grid;
  width: 100%;
  gap: 16px;
  grid-template-columns: 1fr auto;
  max-width: min(1140px, 100% - 24px - 24px);
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
    grid-template-columns: 1fr;
    gap: 0;

    > :last-child {
      margin-top: 0;
    }
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    max-width: 100%;
  }
`

export const Layout = styled.section<{ sideColumn?: boolean }>`
  ${({ sideColumn }) => sideColumn && sideColumnLayout}
`
