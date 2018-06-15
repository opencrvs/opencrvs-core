import styled from 'styled-components'

export const Page = styled.div`
  display: flex;
  min-width: ${({ theme }) => theme.grid.minWidth}px;
  flex-direction: column;
`
