import * as React from 'react'
import styled from 'styled-components'
import { IDataProps, DataRow } from './DataRow'

const Container = styled.div`
  margin-top: 48px;
`
const Title = styled.div`
  ${({ theme }) => theme.fonts.h4Style};
  margin-bottom: 16px;
`
interface IProps {
  title: string
  items: IDataProps[]
}

export class DataSection extends React.Component<IProps> {
  render() {
    const { title, items } = this.props

    return (
      <Container>
        <Title>{title}</Title>
        {items.map((item: IDataProps, index: number) => (
          <DataRow key={index} {...item} />
        ))}
      </Container>
    )
  }
}
