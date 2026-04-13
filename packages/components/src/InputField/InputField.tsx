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
import styled from 'styled-components'
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'
import { InputDescriptor } from './InputDescriptor'

const InputHeader = styled.div``
const ComponentWrapper = styled.span``
const InputDescription = styled.p`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};
`

const DefaultInputWrapper = styled.div``
const HighlightedInputWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  padding: 16px;

  label {
    background-color: ${({ theme }) => theme.colors.primaryLighter};
    border-bottom: ${({ theme }) => `1px solid ${theme.colors.primary}`};
    padding: 12px 16px;
    margin: -16px -16px 16px -16px;
    width: calc(100% + 32px);
  }
`

export interface IInputFieldProps {
  id: string
  label?: string
  className?: string
  helperText?: string
  tooltip?: string
  description?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  touched: boolean
  error?: string
  prefix?: string | JSX.Element
  postfix?: string | JSX.Element
  unit?: string | JSX.Element
  optionalLabel?: string
  children: React.ReactNode
  hideAsterisk?: boolean
  hideErrorLabel?: boolean
  hideInputHeader?: boolean
  htmlFor?: string
  variant?: 'default' | 'highlighted'
}

export const InputField = (props: IInputFieldProps) => {
  const {
    id,
    label,
    helperText,
    tooltip,
    required,
    description,
    error,
    touched,
    hideAsterisk,
    hideErrorLabel,
    hideInputHeader = false,
    prefix,
    htmlFor,
    variant
  } = props

  const postfix = props.postfix as React.ReactNode | string
  const unit = props.unit as React.ReactNode | string

  const isDomElement = (
    nodeType: string | React.JSXElementConstructor<any>
  ) => {
    return typeof nodeType === 'string'
  }

  const children = React.Children.map(
    props.children,
    (node: React.ReactElement) => {
      if (!node) return
      return isDomElement(node.type)
        ? node
        : React.cloneElement(node, { prefix, postfix, unit })
    }
  )

  const InputWrapper =
    variant === 'highlighted' ? HighlightedInputWrapper : DefaultInputWrapper

  return (
    <InputWrapper id={`${id}-form-input`} className={props.className}>
      {!hideInputHeader && (
        <InputHeader>
          {label && (
            <InputLabel
              id={`${id}_label`}
              inputDescriptor={helperText}
              disabled={props.disabled}
              required={required}
              // Since input label does not actually wrap the input, we need to reference it.
              // However, we cannot do it for all FieldTypes since not all of them are actual inputs.
              htmlFor={htmlFor}
              hideAsterisk={hideAsterisk}
              tooltip={tooltip}
              variant={variant}
            >
              {label}
            </InputLabel>
          )}
        </InputHeader>
      )}

      {!hideInputHeader && label && helperText && (
        <InputDescriptor>{helperText}</InputDescriptor>
      )}

      <ComponentWrapper>{children}</ComponentWrapper>

      {error && touched && !hideErrorLabel && (
        <InputError id={props.id + '_error'}>{error}</InputError>
      )}

      {description && <InputDescription>{description}</InputDescription>}
    </InputWrapper>
  )
}
