/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import styled from 'styled-components'

export enum ICON_ALIGNMENT {
  LEFT,
  RIGHT
}

const ButtonBase = styled.button`
  width: auto;
  height: 48px;
  border: 0;
  /* stylelint-disable-next-line opencrvs/no-font-styles */
  font-size: inherit;
  cursor: pointer;
  justify-content: center;
  background: transparent;
  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    path {
      stroke: ${({ theme }) => theme.colors.disabled};
    }
  }
  -webkit-tap-highlight-color: transparent;
  &:focus {
    outline: none;
  }
  padding: 0;
`
export interface IButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: () => React.ReactNode
  align?: ICON_ALIGNMENT
}

export function Button({
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
          {children}
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
  padding: 0 8px;
  align-items: center;
  justify-content: space-between;
  display: flex;
  width: 100%;
`
const CenterWrapper = styled.div`
  padding: 0 8px;
  align-items: center;
  justify-content: center;
  display: flex;
`
const LeftButtonIcon = styled.div`
  display: flex;
  margin-right: 16px;
`
const RightButtonIcon = styled.div`
  display: flex;
  margin-left: 16px;
`
const IconOnly = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
