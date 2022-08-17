import styled from 'styled-components'

export const Section = styled.div`
  display: grid;
  gap: 24px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    gap: 0;
  }
`
