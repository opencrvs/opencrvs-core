/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

type Keys = keyof typeof WORKQUEUE_TABS
export type IWORKQUEUE_TABS = (typeof WORKQUEUE_TABS)[Keys]

export const WORKQUEUE_TABS = {
  myDrafts: 'my-drafts',
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
  leaderboards: 'leaderboards'
} as const

export const TAB_GROUPS = {
  declarations: 'declarationsGroup',
  organisations: 'organisationsGroup',
  performance: 'performanceGroup'
}
