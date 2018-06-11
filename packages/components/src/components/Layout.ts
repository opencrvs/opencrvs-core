export interface IGrid {
  breakpoints: {
    xs: number
    sm: number
    md: number
    lg: number
  }
  columns: number
  gutter: number
  mobileGutter: number
  minWidth: number
}

export const Grid: IGrid = {
  breakpoints: {
    xs: 0,
    sm: 360,
    md: 600,
    lg: 1032
  },
  columns: 12,
  gutter: 12,
  mobileGutter: 8,
  minWidth: 320
}
