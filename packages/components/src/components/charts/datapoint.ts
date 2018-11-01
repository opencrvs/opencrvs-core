// todo separate type for estimate and total
export interface IDataPoint {
  value: number
  label: string
  colour: string
  estimate?: boolean
  total?: boolean
  description: string
}

export const colours = ['#a7b0cf', '#233A86', '#6575AA']
