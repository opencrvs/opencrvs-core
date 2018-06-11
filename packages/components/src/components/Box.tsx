import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { Grid } from './Grid'
import { getPercentageWidthFromColumns } from './utils/grid'

export interface IBox {
  id: string
  columns?: number
  title?: string
  children?: any
  className?: string
  width?: string
}

const styledWrapper: StyledFunction<
IBox & React.HTMLProps<HTMLInputElement>
> = styled.div

const Wrapper = styledWrapper`
  margin: auto;
  width: ${({ width }) => (width ? width : `100%`)};
  padding: 0px ${Grid.gutter}px 0px ${Grid.gutter}px;
  margin: ${Grid.margin}px auto;
  background: white;
  max-width: ${Grid.breakpoints.lg}px;
  box-shadow: 0 0 12px 0 rgba(0,0,0,0.11);
  @media (max-width: ${Grid.breakpoints.lg}px) {
    width: 98%;
    margin-left: 1%;
    margin-right: 1%;
  }
`

export class Box extends React.Component<IBox> {
  render() {
    const { id, title, children, className, columns } = this.props
    const requiredGridColumns:number = ( columns ? columns : Grid.columns)
    return (
      <Wrapper
        id={id}
        className={className}
        width={getPercentageWidthFromColumns(requiredGridColumns, Grid.columns)}
        >
        <h1>{title}</h1>
        {children}
      </Wrapper>
    )
  }
}

