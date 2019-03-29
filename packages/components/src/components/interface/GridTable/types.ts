import { GQLRegStatus } from '@opencrvs/gateway/src/graphql/schema'
import { IAction } from '../ListItem'
export { IAction } from '../ListItem'

export interface IStatus {
  type: GQLRegStatus | null
  practitionerName: string
  timestamp: string | null
  practitionerRole: string
  officeName: string | Array<string | null> | null
}

export interface IDynamicValues {
  [key: string]: string | IAction[] | Array<string | null> | IStatus[] | null
}

export interface IExpandedContentPreference {
  label: string
  displayForEvents?: string[]
  key: string
}
