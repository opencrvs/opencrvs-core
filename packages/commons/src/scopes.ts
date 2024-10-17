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
export const scopes = [
  'natlsysadmin',
  'bypassratelimit',

  'demo',
  'declare',
  'register',
  'certify',
  'performance',
  'sysadmin',
  'validate',
  'teams',
  'config',

  // systems / integrations
  'webhook',
  'nationalId',
  'notification-api',
  'recordsearch',

  // declare
  'record.declare-birth:my-jurisdiction',
  'record.declare-birth',
  'record.declare-death:my-jurisdiction',
  'record.declare-death',
  'record.declare-marriage:my-jurisdiction',
  'record.declare-marriage',
  'record.submit-incomplete',
  'record.submit-for-review',
  'record.assign-unassign-myself',
  'record.unassign-others',

  // validate
  'record.declaration-review',
  'record.declaration-archive',
  'record.declaration-reinstate',
  'record.review-duplicates',
  'record.submit-for-approval',
  'record.submit-for-updates',
  'record.registration-verify-certified-copies',

  // register
  'record.register',

  // certify
  'record.print-records',
  'record.print-records-supporting-documents',
  'record.export-records',
  'record.print-issue-certified-copies',
  'record.bulk-print-certified-copies',

  // correct
  'record.registration-request-correction',
  'record.registration-correct',
  'record.registration-request-revocation',
  'record.registration-revoke',
  'record.registration-request-reinstatement',
  'record.registration-reinstate',

  // search
  'search.birth:my-jurisdiction',
  'search.birth',
  'search.death:my-jurisdiction',
  'search.death',
  'search.marriage:my-jurisdiction',
  'search.marriage',

  // audit
  'record.read',
  'record.read-audit',
  'record.read-comments',
  'record.create-comments',

  // profile
  'profile.update-signature',
  'profile.update-phone-number',
  'profile.update-name',
  'profile.update-profile-image',

  // performance
  'performance.read:my-office',
  'performance.read',
  'performance.read-dashboards',
  'performance.export-vital-statistics',

  // organisation
  'organisation.read',
  'organisation.read-locations:my-office',
  'organisation.read-locations',

  // user
  'user.read:my-office',
  'user.read',
  'user.create',
  'user.create:my-jurisdiction',
  'user.update:my-office',
  'user.update',

  // config
  'config.update:all'
] as const

export type Scope = (typeof scopes)[number]
