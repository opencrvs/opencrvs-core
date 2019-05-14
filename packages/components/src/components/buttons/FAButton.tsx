import * as React from 'react'

import styled from 'styled-components'
const ButtonStyled = styled.button`
  height: 56px;
  width: 56px;
  border-radius: 100%;
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  justify-content: center;
  outline: none;
  border: none;
  cursor: pointer;
  &:hover:enabled {
    background: linear-gradient(
      ${({ theme }) => theme.colors.hoverGradientDark},
      ${({ theme }) => theme.colors.primary}
    );
    color: ${({ theme }) => theme.colors.white};
  }

  &:active:enabled {
    background: ${({ theme }) => theme.colors.primary};
    border: 3px solid ${({ theme }) => theme.colors.creamCan};
    outline: none;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabledButton};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.disabled};
  }
`
interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: () => React.ReactNode
}

export function FAButton({ icon, ...otherProps }: IButtonProps) {
  return <ButtonStyled {...otherProps}>{icon && icon()}</ButtonStyled>
}
