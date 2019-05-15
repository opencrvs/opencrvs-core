import { IAction } from '../ListItem'
export { IAction } from '../ListItem'

export enum GQLRegStatus {
  DRAFT_STARTED = 'DRAFT_STARTED',
  DRAFT_MODIFIED = 'DRAFT_MODIFIED',
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
  [key: string]: string | IAction[] | Array<string | null> | IStatus[] | null
}

export interface IExpandedContentPreference {
  label: string
  displayForEvents?: string[]
  key: string
}
