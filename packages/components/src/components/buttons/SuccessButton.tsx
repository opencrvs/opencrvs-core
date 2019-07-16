import styled from 'styled-components'
import { PrimaryButton } from './PrimaryButton'

export const SuccessButton = styled(PrimaryButton)`
  background-color: ${({ theme }) => theme.colors.success};
  &:hover:enabled {
    background: ${({ theme }) => theme.colors.success};
  }
  &:active:enabled {
    background: ${({ theme }) => theme.colors.success};
  }
`
