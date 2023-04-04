import React from 'react'
import styled from 'styled-components'
import { Text } from '../Text'

export interface BulletListProps {
  id?: string
  items: string[]
  font: 'reg12' | 'reg14' | 'reg16' | 'reg18' | 'h4' | 'h3' | 'h2' | 'h1'
}

const List = styled.ul`
  list-style-type: disc;
`
const ListItem = styled.li`
  margin-bottom: 12px;
  padding-left: 8px;
`

export function BulletList({ id, font, items }: BulletListProps) {
  return (
    <List id={id}>
      <Text variant={font} element="p" color="grey600">
        {items.map((items) => (
          <ListItem key={items}>{items}</ListItem>
        ))}
      </Text>
    </List>
  )
}
