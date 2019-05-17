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
  color: ${({ theme }) => theme.colors.placeholder};
  ${({ theme }) => theme.fonts.bodyStyle};
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
