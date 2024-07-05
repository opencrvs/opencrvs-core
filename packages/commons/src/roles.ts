import { CoreUserRole, Scope } from './authentication'

export type Roles = Array<{
  id: string
  systemRole: CoreUserRole
  labels: Array<{ language: string; label: string }>
  scopes: Scope[]
}>
