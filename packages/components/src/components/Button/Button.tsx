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
import React, {
  ComponentProps,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  ReactNode
} from 'react'
import styled from 'styled-components'
import { Spinner } from '../interface/Spinner'

const Text = styled.span`
  display: inline-block;
  vertical-align: top;
`

const APPEARANCE = {
  PRIMARY: 'primary',
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  SECONDARY: 'secondary',
  TERTIARY: 'tertiary',
  ICON: 'icon'
} as const

const SIZE = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const

export const StyledButton = styled.button<
  StylingProps & { children: ReactElement }
>`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 0;
  outline: none;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  height: 40px;
  padding: 0 12px;
  transition: all 100ms ease-out;
  opacity: 1;
  margin: 0;
  background: transparent;
  ${({ theme }) => theme.fonts.bold16};

  ${(props) =>
    props.size === SIZE.SMALL &&
    `
      height: 32px;
      theme.fonts.bold14;
      padding: 0 12px;
      `}

  ${(props) =>
    props.size === SIZE.MEDIUM &&
    `
      height: 40px;
      padding: 0 16px;
      `}

  ${(props) =>
    props.size === SIZE.LARGE &&
    `
      height: 48px;
      padding: 0 21px;
      `}

  ${(props) =>
    !props.isLoading &&
    `

        &:hover {
          
        }
  
        &:active {
        }
      `}

  ${Text} {
    opacity: 1;
  }

  svg {
    height: ${(props) => (props.size === SIZE.SMALL ? '18' : '24')}px;
    width: ${(props) => (props.size === SIZE.SMALL ? '18' : '24')}px;
    vertical-align: top;
    margin-right: ${(props) => (props.size === SIZE.SMALL ? '-5' : '-8')}px;
    margin-left: ${(props) => (props.size === SIZE.SMALL ? '-5' : '-8')}px;
    margin-top: ${(props) => (props.size === SIZE.SMALL ? '3' : '0')}px;
    pointer-events: none;
  }

  ${(props) =>
    props.disabled &&
    `
        cursor: not-allowed !important;
        opacity: 0.5;
        &:hover {
          transform: none;
        }
      `}

  ${(props) =>
    props.isUnclickable &&
    `
        cursor: default !important;
        pointer-events: none;
        &:hover {
          transform: none;
        }
      `}
  
    ${(props) =>
    props.isLoading &&
    `
        opacity: 0.8;

        ${Text} {
          opacity: 0.8;
        }
  
        &:hover {
          transform: none;
        }
      `}

    ${(props) =>
    props.withIcon &&
    `
          svg {
            margin-right: ${props.size === SIZE.SMALL ? '6' : '8'}px;
          }
          // padding: ${props.size === SIZE.SMALL ? '7' : '12'}px;
        `}
    
  
    ${(props) =>
    props.appearance === APPEARANCE.PRIMARY &&
    `
    background: #4972BB;
    color: #FFFFFF;
  
        ${
          !props.isLoading &&
          `
          &:hover {
            background: #42639C;
          }

          &:focus:not(:hover) {
            color: #222222;
            background-color: #EDC55E;;
          }

          &:focus, &:active {
            background-color #42639C;
            box-shadow:0px 0px 0px 3px #EDC55E inset;
          }
          `
        }
      `}

    ${(props) =>
    props.appearance === APPEARANCE.POSITIVE &&
    `
      background: #409977;
      color: #FFFFFF;
    S
          ${
            !props.isLoading &&
            `
              &:hover {
                background: #49B78D;
              }
              &:focus:not(:hover) {
                color: #222222;
                background-color: #EDC55E;;
              }
    
              &:focus, &:active {
                background-color #49B78D;;
                box-shadow:0px 0px 0px 3px #EDC55E inset;
              }
            `
          }
        `}

    ${(props) =>
    props.appearance === APPEARANCE.NEGATIVE &&
    `
      background: #D53F3F;
      color: #FFFFFF;
    
          ${
            !props.isLoading &&
            `
              &:hover {
                background: #994040;
              }
              &:focus:not(:hover) {
                color: #222222;
                background-color: #EDC55E;;
              }
    
              &:focus, &:active {
                background-color #994040;;
                box-shadow:0px 0px 0px 3px #EDC55E inset;
              }
            `
          }
        `}
  
    ${(props) =>
    props.appearance === APPEARANCE.SECONDARY &&
    `
        border: 2px solid #4972BB;
        color: #4972BB;
  
        ${
          !props.isLoading &&
          `
            &:hover {
              border: 2px solid #42639C;
              color: #42639C;
            }
            &:focus:not(:hover) {
              color: #222222;
              background-color: #EDC55E;;
              border: 2px solid #EDC55E;
            }
  
            &:focus, &:active {
              color #42639C;;
              box-shadow:0px 0px 0px 3px #EDC55E inset;
          `
        }
      `}
  
    ${(props) =>
    props.appearance === APPEARANCE.TERTIARY &&
    `
      height: 32px;
      padding: 0 12px;
      background: #FFFFFF;
      color: #4972BB;
      font-size: 14px;
  
        ${
          !props.isLoading &&
          `
            &:hover {
              background: #EEEEEE;
            }
            &:focus {
              background: #EDC55E;
              color: #222222
            }
            &:active {
              background: #EEEEEE;
            }
          `
        }
      `}

      ${(props) =>
    props.appearance === APPEARANCE.ICON &&
    `
            background: #FFFFFF;
            color: #4972BB;
            border-radius:100%;
      
            ${
              !props.isLoading &&
              `
                &:hover {
                  background: #EEEEEE;
                  color: #42639C;
                }
                &:focus {
                  background: #EDC55E;
                  color: #222222
                }
                &:active {
                  background: #EEEEEE;
                  color: #42639C;
                }
              `
            }
          `}
`

const ButtonLink = styled.a``

interface StylingProps {
  isLoading?: boolean
  isUnclickable?: boolean
  withIcon?: boolean
  disabled?: boolean
  size?: typeof SIZE[keyof typeof SIZE]
  appearance?: typeof APPEARANCE[keyof typeof APPEARANCE]
}

interface ConfigProps {
  isLink?: boolean
  ButtonWrapper?: keyof JSX.IntrinsicElements | React.ComponentType<any>
  isDisabled?: boolean
  isLoading?: boolean
  loadingText?: ReactNode
}

export const Button = forwardRef<
  unknown,
  PropsWithChildren<
    ConfigProps &
      StylingProps &
      (JSX.IntrinsicElements['button'] & JSX.IntrinsicElements['a'])
  >
>(
  (
    {
      children,
      isDisabled = false,
      isLoading,
      loadingText = null,
      isLink,
      withIcon,
      ButtonWrapper = null,
      appearance = 'tertiary',
      ...rest
    },
    ref
  ) => {
    if (ButtonWrapper) {
      return (
        <StyledButton
          as={ButtonWrapper}
          disabled={isDisabled}
          isLoading={isLoading}
          withIcon={withIcon}
          appearance={appearance}
          {...rest}
          ref={ref}
        >
          <>
            {isLoading && <Spinner id="button-loading" size={48} />}
            <Text>{children}</Text>
          </>
        </StyledButton>
      )
    }
    if (isLink) {
      return (
        <StyledButton
          as={ButtonLink}
          isLoading={isLoading}
          withIcon={withIcon}
          appearance={appearance}
          {...rest}
          ref={ref}
        >
          <>
            {isLoading && <Spinner id="button-loading" size={48} />}
            <Text>{children}</Text>
          </>
        </StyledButton>
      )
    }
    return (
      <StyledButton
        disabled={isDisabled}
        isLoading={isLoading}
        withIcon={withIcon}
        appearance={appearance}
        {...rest}
        ref={ref as ComponentProps<typeof StyledButton>['ref']}
      >
        <>
          {isLoading && <Spinner id="button-loading" size={24} />}
          <Text>{children}</Text>
        </>
      </StyledButton>
    )
  }
)
