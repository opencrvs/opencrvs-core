import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { grid } from './grid'
import { getPercentageWidthFromColumns } from './utils/grid'

export interface IBox {
  id: string
  columns?: number
  title?: string
  children?: any
  className?: string
  width?: string
}

const styledWrapper = styled.div.attrs<IBox>({})

const Wrapper = styledWrapper`
  margin: auto;
  width: ${({ width }) => (width ? width : `100%`)};
  padding: 0px ${grid.gutter}px 0px ${grid.gutter}px;
  margin: ${grid.margin}px auto;
  background: white;
  max-width: ${grid.breakpoints.lg}px;
  box-shadow: 0 0 12px 0 rgba(0,0,0,0.11);
  @media (max-width: ${grid.breakpoints.lg}px) {
    width: 98%;
    margin-left: 1%;
    margin-right: 1%;
  }
`

export class Box extends React.Component<IBox> {
  render() {
    const { id, title, children, className, columns } = this.props
    const requiredgridColumns:number = ( columns ? columns : grid.columns)
    return (
      <Wrapper
        id={id}
        className={className}
        width={getPercentageWidthFromColumns(requiredgridColumns, grid.columns)}
        >
        <h1>{title}</h1>
        {children}
      </Wrapper>
    )
  }
}

