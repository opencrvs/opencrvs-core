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
import { RadioButton } from './RadioButton'
import { NoticeWrapper } from '../DateField'
import { InputLabel } from '../InputField/InputLabel'
import styled from 'styled-components'

const Wrapper = styled.div`
  width: 100%;
`

const List = styled.ul<{ flexDirection?: string }>`
  list-style: none;
  margin: 0;
  padding: 0;
  ${({ flexDirection }) =>
    flexDirection &&
    `display: flex;
    `}
`
const LargeList = styled.ul<{ flexDirection?: string }>`
  list-style: none;
  margin: 0;
  padding: 0;
  ${({ flexDirection }) =>
    flexDirection &&
    `display: flex;
    & > div {
      width: 100%;
    }`}
`
const NestedChildren = styled.div`
  margin: 0px 0px 0px 32px;
  padding-left: 33px;
  border-left: 2px solid ${({ theme }) => theme.colors.copy};
  padding-top: 0px !important;
`

export enum RadioSize {
  LARGE = 'large',
  NORMAL = 'normal'
}

interface IConditionals {
  action: string
  expression: string
}
export interface IRadioOption {
  label: string
  value: string | boolean
  param?: Record<string, string>
  conditionals?: IConditionals[]
  disabled?: boolean
}

export interface IRadioGroupProps {
  options: IRadioOption[]
  name: string
  value: string
  size?: RadioSize
  notice?: string
  nestedFields?: { [key: string]: JSX.Element[] }
  flexDirection?: string
  onChange: (value: string) => void
}

export const RadioGroup = ({
  options,
  value,
  name,
  size,
  notice,
  nestedFields,
  flexDirection,
  ...props
}: IRadioGroupProps) => (
  <Wrapper>
    {notice && (
      <NoticeWrapper>
        <InputLabel>{notice}</InputLabel>
      </NoticeWrapper>
    )}
    {size && size === RadioSize.LARGE ? (
      <LargeList>
        {options.map((option) => {
          return (
            <div key={option.label}>
              <RadioButton
                {...props}
                size={'large'}
                name={name}
                disabled={option.disabled}
                label={option.label}
                value={option.value}
                id={
                  option.param
                    ? `${name}_${option.value}_${Object.values(
                        option.param
                      ).toString()}`
                    : `${name}_${option.value}`
                }
                selected={value}
                onChange={props.onChange}
                hasFlexDirection={flexDirection ? true : false}
              />
              {nestedFields &&
                value === option.value &&
                nestedFields[value] && (
                  <NestedChildren>{nestedFields[value]}</NestedChildren>
                )}
            </div>
          )
        })}
      </LargeList>
    ) : (
      <List flexDirection={flexDirection}>
        {options.map((option) => {
          return (
            <div key={option.label}>
              <RadioButton
                {...props}
                size={'small'}
                name={name}
                disabled={option.disabled}
                label={option.label}
                value={option.value}
                id={
                  option.param
                    ? `${name}_${option.value}_${Object.values(
                        option.param
                      ).toString()}`
                    : `${name}_${option.value}`
                }
                selected={value}
                onChange={props.onChange}
                hasFlexDirection={flexDirection ? true : false}
              />
            </div>
          )
        })}
      </List>
    )}
  </Wrapper>
)
