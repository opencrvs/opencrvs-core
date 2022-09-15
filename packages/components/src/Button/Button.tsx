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

import React from 'react'
import styled from 'styled-components'
import { Spinner } from '../Spinner'
import * as styles from './Button.styles'

export const BUTTON_SIZES = ['small', 'medium', 'large'] as const
export const BUTTON_VARIANTS = [
  'primary',
  'secondary',
  'tertiary',
  'positive',
  'negative'
] as const
export const BUTTON_MODIFIERS = ['disabled', 'loading', 'icon'] as const

export type ButtonVariant = typeof BUTTON_VARIANTS[number]
export type ButtonModifier = typeof BUTTON_MODIFIERS[number]

export interface ButtonCustomization
  extends React.HTMLAttributes<HTMLButtonElement> {
  /** Size of the button */
  size?: typeof BUTTON_SIZES[number]
  /** Element the button renders as */
  element?: 'a' | 'button'
}

export type ButtonProps = ButtonCustomization & {
  [variant in ButtonVariant]: boolean
} & {
  [modifier in ButtonModifier]: boolean
}

type StyledButtonProps = Omit<ButtonProps, ButtonVariant> & {
  variant: ButtonVariant
}
const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    // https://styled-components.com/docs/api#shouldforwardprop
    // Leave some props unpassed to DOM
    !['loading'].includes(prop) && defaultValidatorFn(prop)
})<StyledButtonProps>`
  ${styles.baseStyles}

  ${(props) => props.size === 'small' && styles.smallStyles(props)}
  ${(props) => props.size === 'medium' && styles.mediumStyles}
  ${(props) => props.size === 'large' && styles.largeStyles}

  ${(props) => props.variant === 'primary' && styles.primaryStyles(props)}
  ${(props) => props.variant === 'secondary' && styles.secondaryStyles}
  ${(props) => props.variant === 'tertiary' && styles.tertiaryStyles}
  ${(props) => props.variant === 'positive' && styles.positiveStyles}
  ${(props) => props.variant === 'negative' && styles.negativeStyles}

  ${(props) => props.icon && styles.globalIconStyles}
  ${(props) => props.loading && styles.globalLoadingStyles}
  ${(props) => props.disabled && styles.globalDisabledStyles}
`

export const Button = ({
  size = 'medium',
  element = 'button',
  loading,
  children,
  ...props
}: ButtonProps) => {
  const variant = BUTTON_VARIANTS.find((variant) => props[variant]) ?? 'primary'

  return (
    <StyledButton
      size={size}
      variant={variant}
      loading={loading}
      as={element}
      {...props}
    >
      {loading && (
        <Spinner id="button-loading" size={24} baseColor="currentColor" />
      )}
      {children}
    </StyledButton>
  )
}
