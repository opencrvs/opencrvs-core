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
  margin-top: 8px;
  margin-bottom: 0px;
`

const List = styled.ul<{ flexDirection?: string }>`
  list-style: none;
  margin: 0;
  padding: 0;
  & > div {
    margin-bottom: 16px;
  }
  ${({ flexDirection }) =>
    flexDirection &&
    `display: flex;
    & > div {
      margin-right: 16px;
    }`}
`
const LargeList = styled.ul<{ flexDirection?: string }>`
  list-style: none;
  margin: 0;
  padding: 0;
  & > div {
    margin-bottom: 16px;
  }
  ${({ flexDirection }) =>
    flexDirection &&
    `display: flex;
    & > div {
      margin-right: 16px;
    }`}
`
const NestedChildren = styled.div`
  margin: 15px 0px 0px 18px;
  padding-left: 33px;
  border-left: 4px solid ${({ theme }) => theme.colors.copy};
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

export class RadioGroup extends React.Component<IRadioGroupProps> {
  render() {
    const {
      options,
      value,
      name,
      size,
      notice,
      nestedFields,
      flexDirection,
      ...props
    } = this.props

    return (
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
                    id={`${name}_${option.value}`}
                    selected={value}
                    onChange={this.props.onChange}
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
                    id={`${name}_${option.value}`}
                    selected={value}
                    onChange={this.props.onChange}
                    hasFlexDirection={flexDirection ? true : false}
                  />
                </div>
              )
            })}
          </List>
        )}
      </Wrapper>
    )
  }
}
