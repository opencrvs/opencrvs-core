type Keys = keyof typeof WORKQUEUE_TABS
export type IWORKQUEUE_TABS = (typeof WORKQUEUE_TABS)[Keys]

export const WORKQUEUE_TABS = {
  inProgress: 'progress',
  inProgressFieldAgent: 'progress/field-agents',
  sentForReview: 'sentForReview',
  readyForReview: 'readyForReview',
  requiresUpdate: 'requiresUpdate',
  sentForApproval: 'approvals',
  readyToPrint: 'print',
  outbox: 'outbox',
  externalValidation: 'waitingValidation',
  performance: 'performance',
  vsexports: 'vsexports',
  team: 'team',
  config: 'config',
  organisation: 'organisation',
  application: 'application',
  certificate: 'certificate',
  systems: 'integration',
  userRoles: 'userroles',
  settings: 'settings',
  logout: 'logout',
  communications: 'communications',
  informantNotification: 'informantnotification',
  emailAllUsers: 'emailAllUsers',
  readyToIssue: 'readyToIssue',
  dashboard: 'dashboard',
  statistics: 'statistics',
  leaderboards: 'leaderboards',
  report: 'report'
} as const

export const TAB_GROUPS = {
  declarations: 'declarationsGroup',
  organisations: 'organisationsGroup',
  performance: 'performanceGroup'
}
