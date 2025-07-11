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
import * as React from 'react'
import { IButtonSize, dimensionsMap } from '.'
import styled from 'styled-components'

export enum ICON_ALIGNMENT {
  LEFT,
  RIGHT
}
const ButtonBase = styled.button.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    ['popovertarget'].includes(prop) || defaultValidatorFn(prop)
  // Forward popovertarget prop directly
})<{ size: IButtonSize; dropdownName?: string }>`
  anchor-name: ${({ dropdownName }) =>
    `--Dropdown-Anchor-${dropdownName || ''}`};
  width: auto;
  height: ${({ size }) => dimensionsMap[size]};
  border: 0;
  /* stylelint-disable-next-line opencrvs/no-font-styles */
  font-size: inherit;
  cursor: pointer;
  justify-content: center;
  background: transparent;
  &:disabled {
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
  size?: IButtonSize
  align?: ICON_ALIGNMENT
  popovertarget?: string
  dropdownName?: string
}

export function Button({
  icon,
  children,
  align = ICON_ALIGNMENT.RIGHT,
  size = 'large',
  ...otherProps
}: IButtonProps) {
  if (icon && children) {
    return (
      <ButtonBase size={size} {...otherProps}>
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
      <ButtonBase size={size} {...otherProps}>
        {' '}
        <IconOnly>{icon()}</IconOnly>
      </ButtonBase>
    )
  } else {
    return (
      <ButtonBase size={size} {...otherProps}>
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
  margin-right: 8px;
`
const RightButtonIcon = styled.div`
  display: flex;
  margin-left: 8px;
`
const IconOnly = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
