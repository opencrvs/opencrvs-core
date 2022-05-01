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
import styled from '@client/styledComponents'
import { ISelectProps } from '@opencrvs/components/lib/select'
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
  &:last-child {
    border-left: none;
  }
`

const Container = styled.div`
  margin: 0;
  border-radius: 2px;
  height: 32px;
`
export function SegmentedControl(
  props: Omit<ISelectProps, 'options' | 'onChange'> & {
    options: IPerformanceSelectOption[]
    onChange: (option: IPerformanceSelectOption) => void
  }
) {
  return (
    <Container>
      {props.options.map((opt, i) => (
        <Segment
          key={`${opt.label}_${i}`}
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
