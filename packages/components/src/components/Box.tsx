import * as React from 'react'
import styled, { StyledFunction, withTheme } from 'styled-components'

import { IGrid } from './grid'
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
  ${({ theme }) => theme.fonts.defaultFontStyle}
  width: ${({ width }) => (width ? width : `100%`)};
  padding: 0px ${({ theme }) => theme.grid.gutter}px 0px ${({ theme }) =>
  theme.grid.gutter}px;
  margin: ${({ theme }) => theme.grid.margin}px auto;
  background: white;
  max-width: ${({ theme }) => theme.grid.breakpoints.lg}px;
  box-shadow: 0 0 12px 0 rgba(0,0,0,0.11);
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 98%;
    margin-left: 1%;
    margin-right: 1%;
  }
`

class Component extends React.Component<IBox & { theme: { grid: IGrid } }> {
  render() {
    const { id, title, children, className, columns, theme } = this.props
    const requiredGridColumns: number = columns ? columns : theme.grid.columns
    return (
      <Wrapper
        id={id}
        className={className}
        width={getPercentageWidthFromColumns(
          requiredGridColumns,
          theme.grid.columns
        )}
      >
        <h1>{title}</h1>
        {children}
      </Wrapper>
    )
  }
}

export const Box = withTheme(Component)
