import styled from 'styled-components'
import { Box } from '../Box'
import { Stack } from '../Stack'

export const MainContainer = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
`

export const ReadersContainer = styled(Stack)`
  width: 100%;

  & > * {
    flex-grow: 1;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-direction: column;

    & > * {
      width: 100%;
    }
  }
`

export const Header = styled(Stack)`
  background-color: ${({ theme }) => theme.colors.orangeLighter};
  padding: 8x 16px;
`
