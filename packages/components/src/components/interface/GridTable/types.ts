import { IAction } from '../ListItem'
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

export interface IDynamicValues {
  [key: string]:
    | string
    | IAction[]
    | Array<string | null>
    | IStatus[]
    | React.ReactNode[]
    | null
    | undefined
}

export interface IExpandedContentPreference {
  label: string
  displayForEvents?: string[]
  key: string
}
