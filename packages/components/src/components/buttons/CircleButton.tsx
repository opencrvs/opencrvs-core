import styled from 'styled-components'

export const CircleButton = styled.button.attrs<{ dark?: boolean }>({})`
  margin: 0;
  border: none;
  background: none;
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  transition: background-color 0.3s ease;
  border-radius: 100%;
  &:hover {
    background-color: ${({ theme, dark }) =>
      dark ? theme.colors.primary : theme.colors.background};
  }
  &:active {
    background-color: transparent;
  }
  cursor: pointer;
`
