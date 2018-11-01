// todo separate type for estimate and total
export interface IDataPointBase {
  value: number
  label: string
  colour: string
  estimate?: boolean
  total?: boolean
}

export interface IEstimateDataPoint extends IDataPointBase {
  description: string
}

export type IDataPoint = IDataPointBase | IEstimateDataPoint

export const colours = ['#a7b0cf', '#233A86', '#6575AA']
