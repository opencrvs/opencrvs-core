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
import { ISelect2Props } from '@opencrvs/components/lib/Select/Select2'
import React from 'react'
import { IPerformanceSelectOption } from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { Button } from '@opencrvs/components/lib/buttons'

const Segment = styled(Button)<{ isSelected?: boolean }>`
  ${({ theme }) => theme.fonts.bold14}
  ${({ isSelected, theme }) =>
    isSelected
      ? `
    background: ${theme.colors.primary};
    color: ${theme.colors.white};
  `
      : `background: ${theme.colors.white};
    color: ${theme.colors.primary};`}
  height: 32px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  &:first-child {
    border-radius: 4px 0 0 4px;
    border-right-width: 0px;
  }
  &:last-child {
    border-radius: 0 4px 4px 0;
    border-left: none;
  }
  &:disabled {
    border: ${({ theme }) => `2px solid ${theme.colors.grey300}`};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.grey300};
  }
`

const Container = styled.div`
  margin: 0;
`
export function SegmentedControl(
  props: Omit<ISelect2Props, 'options' | 'onChange'> & {
    options: (IPerformanceSelectOption & { disabled?: boolean })[]
    onChange: (option: IPerformanceSelectOption) => void
  }
) {
  return (
    <Container>
      {props.options.map((opt, i) => (
        <Segment
          key={`${opt.label}_${i}`}
          id={`${opt.label}_${i}`}
          disabled={opt.disabled}
          isSelected={opt.value === props.value}
          onClick={() => {
            if (props.onChange) {
              props.onChange(opt)
            }
          }}
        >
          {opt.label}
        </Segment>
      ))}
    </Container>
  )
}
