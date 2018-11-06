import * as React from 'react'
import { InputField, IInputFieldProps } from '../forms'
import { Omit } from '../omit'
import styled from 'styled-components'
import {
  ISelectGroupProps,
  ISelectGroupValue,
  SelectGroup
} from './SelectGroup'

const Wrapper = styled.div`
  width: 100%;
  flex: 1 0 auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`
interface ISortAndFilterItem {
  selects: Omit<ISelectGroupProps, 'onChange'>
  input: IInputFieldProps
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
        <InputField {...sortBy.input}>
          <SelectGroup {...sortBy.selects} onChange={onChangeSort} />
        </InputField>
        <InputField {...filterBy.input}>
          <SelectGroup {...filterBy.selects} onChange={onChangeFilter} />
        </InputField>
      </Wrapper>
    )
  }
}
