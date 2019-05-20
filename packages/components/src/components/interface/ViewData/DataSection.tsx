import * as React from 'react'
import styled from 'styled-components'
import { IDataProps, DataRow } from './DataRow'

const Container = styled.div`
  margin-top: 52px;
`
const Title = styled.div`
  font-weight: 600;
  font-size: 24px;
  line-height: 36px;
  margin: 0 0 16px 8px;
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
