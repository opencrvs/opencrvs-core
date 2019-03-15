// todo separate type for estimate and total
export interface IDataPoint {
  value: number
  label: React.ReactNode
  estimate?: boolean
  total?: boolean
  description?: string
}
