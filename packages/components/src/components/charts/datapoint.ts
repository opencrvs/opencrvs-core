// todo separate type for estimate and total
export interface IDataPoint {
  value: number
  label: string
  estimate?: boolean
  total?: boolean
  description: string
}
