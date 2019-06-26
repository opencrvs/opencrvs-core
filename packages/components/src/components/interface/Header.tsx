import styled from 'styled-components'

export const Header = styled.section`
  display: flex;
  flex-direction: column;

  color: ${({ theme }) => theme.colors.white};

  overflow: visible;
  ${({ theme }) => theme.gradients.gradientNightshade};
  ${({ theme }) => theme.shadows.mistyShadow};
  position: relative;
`
