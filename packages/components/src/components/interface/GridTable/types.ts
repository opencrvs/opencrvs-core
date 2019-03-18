import { GQLRegStatus } from '@opencrvs/gateway/src/graphql/schema'

export interface IAction {
  label: string
  handler: () => void
}

interface IStatus {
  type: GQLRegStatus | null | undefined
  practitionerName: string
  timestamp: string | null
  practitionerRole: string
  officeName: string | Array<string | null> | null | undefined
}

export interface IDynamicValues {
  [key: string]:
    | string
    | IAction[]
    | Array<string | null>
    | IStatus[]
    | undefined
}
