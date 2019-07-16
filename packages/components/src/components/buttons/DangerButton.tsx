import styled from 'styled-components'
import { PrimaryButton } from './PrimaryButton'

export const DangerButton = styled(PrimaryButton)`
  background-color: ${({ theme }) => theme.colors.error};
  &:hover:enabled {
    background: ${({ theme }) => theme.colors.error};
  }
  &:active:enabled {
    background: ${({ theme }) => theme.colors.error};
  }
`
