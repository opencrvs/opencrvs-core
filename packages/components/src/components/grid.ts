import styled from 'styled-components'
export interface IGrid {
  breakpoints: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  columns: number
  gutter: number
  mobileGutter: number
  minWidth: number
  margin: number
}

export const grid: IGrid = {
  breakpoints: {
    xs: 0,
    sm: 359,
    md: 599,
    lg: 1023,
    xl: 1279
  },
  columns: 12,
  gutter: 12,
  mobileGutter: 8,
  minWidth: 320,
  margin: 20
}

export const FlexGrid = styled.div`
  display: flex;
  flex-flow: row nowrap;
`
