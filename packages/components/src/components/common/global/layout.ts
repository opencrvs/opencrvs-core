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

export const grid: IGrid = {
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

export interface IHeight {
  header: number
  menu: number
  accordionClosed: number
  primaryButton: number
  callToActionButton: number
  formElement: number
}

export const heights: IHeight = {
  header: 80,
  menu: 48,
  accordionClosed: 96,
  primaryButton: 44,
  callToActionButton: 71,
  formElement: 90
}

export interface IWidth {
  mobileMenu: number
}

export const widths: IWidth = {
  mobileMenu: 200
}
