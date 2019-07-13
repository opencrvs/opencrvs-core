import { IAction } from '../ListItem'
import { ColumnContentAlignment } from './GridTable'
export { IAction } from '../ListItem'

enum GQLRegStatus {
  DECLARED = 'DECLARED',
  REGISTERED = 'REGISTERED',
  CERTIFIED = 'CERTIFIED',
  REJECTED = 'REJECTED'
}

export interface IStatus {
  type: GQLRegStatus | null
  practitionerName: string
  timestamp: string | null
  practitionerRole: string
  officeName: string | Array<string | null> | null
}

export interface IColumn {
  label?: string
  width: number
  key: string
  errorValue?: string
  alignment?: ColumnContentAlignment
  isActionColumn?: boolean
  isIconColumn?: boolean
  color?: string
}

export interface IDynamicValues {
  [key: string]:
    | string
    | IAction[]
    | Array<string | null>
    | IStatus[]
    | React.ReactNode[]
    | JSX.Element
    | null
    | undefined
}
