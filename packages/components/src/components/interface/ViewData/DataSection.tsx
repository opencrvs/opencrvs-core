import * as React from 'react'
import styled from 'styled-components'
import { IDataProps, DataRow } from './DataRow'

const Container = styled.div`
  margin-top: 48px;
`
const Title = styled.div`
  ${({ theme }) => theme.fonts.h4Style};
  margin-bottom: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.h5Style};
  }
`
interface IProps {
  id?: string
  title: string
  items: IDataProps[]
}

export class DataSection extends React.Component<IProps> {
  render() {
    const { id, title, items } = this.props

    return (
      <Container id={id}>
        <Title>{title}</Title>
        {items.map((item: IDataProps, index: number) => (
          <DataRow id={item.label.split(' ').join('-')} key={index} {...item} />
        ))}
      </Container>
    )
  }
}
