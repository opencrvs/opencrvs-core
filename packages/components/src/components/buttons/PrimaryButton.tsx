import styled from 'styled-components'
import { Button } from './Button'

export const PrimaryButton = styled(Button)`
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  justify-content: center;
  border-radius: 2px;
  ${({ theme }) => theme.fonts.capsFontStyle};

  &:hover:enabled {
    background: linear-gradient(
      ${({ theme }) => theme.colors.hoverGradientDark},
      ${({ theme }) => theme.colors.primary}
    );
    color: ${({ theme }) => theme.colors.white};
  }
  &:focus {
    outline: none;
  }

  &:active:enabled {
    outline: none;
    background: ${({ theme }) => theme.colors.primary};
    padding: 0 3px;
    border: 3px solid ${({ theme }) => theme.colors.creamCan};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabledButton};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.disabled};
  }
`
