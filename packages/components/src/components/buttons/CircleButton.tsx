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
    ${({ theme, dark }) =>
      dark
        ? theme.gradients.gradientSkyDark
        : 'background-color: ' + theme.colors.dropdownHover};
  }
  &:active {
    background-color: transparent;
  }
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
`
