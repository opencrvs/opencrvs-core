import * as React from 'react'
import styled from 'styled-components'

const StyledList = styled.ul`
  width: 100%;
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
`

const StyledListItem = styled.li`
  margin-top: 10px;
  margin-bottom: 10px;
`

export interface IListProps {
  id?: string
  list: string[]
}

export const List = ({ list, id }: IListProps) => {
  return (
    <StyledList id={id}>
      {list.map((item: string, index: number) => (
        <StyledListItem key={index}>{item}</StyledListItem>
      ))}
    </StyledList>
  )
}
