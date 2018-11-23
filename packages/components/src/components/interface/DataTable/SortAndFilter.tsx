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
  flex: 1 0 auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 10px;
`
const LabelText = styled.div`
  color: ${({ theme }) => theme.colors.placeholder};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 16px;
  font-weight: 500;
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
  sortBy: ISortAndFilterItem
  filterBy: ISortAndFilterItem
  onChangeSort: (
    value: ISelectGroupValue,
    changedValue: ISelectGroupValue
  ) => void
  onChangeFilter: (
    value: ISelectGroupValue,
    changedValue: ISelectGroupValue
  ) => void
}

export class SortAndFilter extends React.Component<ISortAndFilterPrpos> {
  render() {
    const { sortBy, filterBy, onChangeSort, onChangeFilter } = this.props
    return (
      <Wrapper>
        <ComponentWrapper>
          <LabelText>{sortBy.input.label}</LabelText>
          <SelectGroup {...sortBy.selects} onChange={onChangeSort} />
        </ComponentWrapper>
        <ComponentWrapper>
          <LabelText>{filterBy.input.label}</LabelText>
          <SelectGroup {...filterBy.selects} onChange={onChangeFilter} />
        </ComponentWrapper>
      </Wrapper>
    )
  }
}
