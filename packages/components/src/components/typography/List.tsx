import * as React from 'react'
import styled from 'styled-components'

const StyledList = styled.ul`
  width: 100%;
  font-family: ${({ theme }) => theme.fonts.regularFont};
`

const StyledListItem = styled.li`
  margin-top: 10px;
  margin-bottom: 10px;
`

export interface IListProps {
  list: string[]
}

export const List = ({ list }: IListProps) => {
  return (
    <StyledList>
      {list.map((item: string, index: number) => (
        <StyledListItem key={index}>{item}</StyledListItem>
      ))}
    </StyledList>
  )
}
