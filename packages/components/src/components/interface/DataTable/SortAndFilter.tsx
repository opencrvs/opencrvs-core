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
import { InputField, IInputFieldProps } from '../../forms'
import { Omit } from '../../omit'
import styled from 'styled-components'
import {
  ISelectGroupProps,
  ISelectGroupValue,
  SelectGroup
} from '../SelectGroup'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-top: 15px;
`
const LabelText = styled.div`
  color: ${({ theme }) => theme.colors.supportingCopy};
  ${({ theme }) => theme.fonts.reg16};
`
const ComponentWrapper = styled.span`
  flex-direction: column;
`
export interface IInputLabel {
  label: string
}
export interface ISortAndFilterItem {
  selects: Omit<ISelectGroupProps, 'onChange'>
  input: IInputLabel
}

interface ISortAndFilterPrpos {
  sortBy?: ISortAndFilterItem
  filterBy?: ISortAndFilterItem
  onChangeSort?: (
    value: ISelectGroupValue,
    changedValue: ISelectGroupValue
  ) => void
  onChangeFilter?: (
    value: ISelectGroupValue,
    changedValue: ISelectGroupValue
  ) => void
}

export class SortAndFilter extends React.Component<ISortAndFilterPrpos> {
  render() {
    const { sortBy, filterBy, onChangeSort, onChangeFilter } = this.props
    return (
      <Wrapper>
        {sortBy && (
          <ComponentWrapper>
            <LabelText>{sortBy.input.label}</LabelText>
            <SelectGroup {...sortBy.selects} onChange={onChangeSort} />
          </ComponentWrapper>
        )}
        {filterBy && (
          <ComponentWrapper>
            <LabelText>{filterBy.input.label}</LabelText>
            <SelectGroup {...filterBy.selects} onChange={onChangeFilter} />
          </ComponentWrapper>
        )}
      </Wrapper>
    )
  }
}
