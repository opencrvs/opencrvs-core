import styled from 'styled-components'
import * as React from 'react'

export const TertiaryButton = styled(Button)`
  width: auto;
  ${({ theme }) => theme.fonts.buttonStyle};
  transition: background 0.4s ease;
  align-items: center;
  border: 0;
  text-transform: none !important;
  cursor: pointer;
  height: 32px;
  & > div {
    padding: 0 8px;
  }
  color: ${({ theme }) => theme.colors.tertiary};
  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
  }
  &:hover {
    opacity: 0.8;
    background: ${({ theme }) => theme.colors.background};
  }

  &:active {
    background: ${({ theme }) => theme.colors.focus};
  }
`

enum ICON_ALIGNMENT {
  LEFT,
  RIGHT
}

const ButtonBase = styled.button`
  width: auto;
  height: 32px;
  border: 0;
  cursor: pointer;
  background: transparent;
  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    path {
      stroke: ${({ theme }) => theme.colors.disabled};
    }
  }
  -webkit-tap-highlight-color: transparent;
`
interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: () => React.ReactNode
  align?: ICON_ALIGNMENT
}

function Button({
  icon,
  children,
  align = ICON_ALIGNMENT.RIGHT,
  ...otherProps
}: IButtonProps) {
  if (icon && children) {
    return (
      <ButtonBase {...otherProps}>
        <Wrapper>
          {icon && align === ICON_ALIGNMENT.LEFT && (
            <LeftButtonIcon>{icon()}</LeftButtonIcon>
          )}
          <span>{children}</span>
          {icon && align === ICON_ALIGNMENT.RIGHT && (
            <RightButtonIcon>{icon()}</RightButtonIcon>
          )}
        </Wrapper>
      </ButtonBase>
    )
  } else if (icon && !children) {
    return (
      <ButtonBase {...otherProps}>
        {' '}
        <IconOnly>{icon()}</IconOnly>
      </ButtonBase>
    )
  } else {
    return (
      <ButtonBase {...otherProps}>
        <CenterWrapper>{children}</CenterWrapper>
      </ButtonBase>
    )
  }
}
const Wrapper = styled.div`
  padding: 0 32px;
  align-items: center;
  justify-content: space-between;
  display: inline-flex;
  width: 100%;
`
const CenterWrapper = styled.div`
  padding: 0 20px;
  align-items: center;
  justify-content: center;
  display: inline-flex;
`
const LeftButtonIcon = styled.div`
  position: relative !important;
  margin-right: 8px;
  margin-top: 5px;
`
const RightButtonIcon = styled.div`
  position: relative !important;
  display: flex;
  justify-content: center;
  margin-left: 20px;
`
const IconOnly = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
