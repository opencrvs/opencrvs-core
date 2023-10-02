/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import styled from 'styled-components'
import * as React from 'react'

export const TertiaryButton = styled(Button)`
  width: auto;
  ${({ theme }) => theme.fonts.bold14};
  transition: background 0.4s ease;
  align-items: center;
  border: 0;
  border-radius: 4px;
  text-transform: none !important;
  height: 32px;
  & > div {
    padding: 0 8px;
    height: 32px;
  }
  color: ${({ theme }) => theme.colors.primary};
  &:hover {
    background: ${({ theme }) => theme.colors.grey200};
  }
  &:not([data-focus-visible-added]):hover {
    background: ${({ theme }) => theme.colors.grey200};
  }
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:not([data-focus-visible-added]) {
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.colors.primary};
  }
  &:active:not([data-focus-visible-added]) {
    background: ${({ theme }) => theme.colors.grey200};
  }

  &:disabled:hover {
    background: ${({ theme }) => theme.colors.white};
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
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.disabled};
    path {
      stroke: ${({ theme }) => theme.colors.disabled};
    }
  }
  -webkit-tap-highlight-color: transparent;
  padding: 0;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-right: 8px;
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
