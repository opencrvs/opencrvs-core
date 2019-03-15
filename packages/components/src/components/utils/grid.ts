export const getPercentageWidthFromColumns = (
  columns: number,
  totalColumns: number
): string => {
  return `${100 / (totalColumns / columns)}%`
}
