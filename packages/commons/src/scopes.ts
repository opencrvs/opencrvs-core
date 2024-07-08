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
  // declare
  'record.declare-birth:my-jurisdiction',
  'record.declare-birth',
  'record.declare-death:my-jurisdiction',
  'record.declare-death',
  'record.declare-marriage:my-jurisdiction',
  'record.declare-marriage',
  'record.submit-incomplete',
  'record.submit-for-review',
  'record.submit-for-approval',
  'record.submit-for-updates',
  'record.assign-unassign-myself',
  'record.unassign-others',

  // validate
  'record.update',
  'record.review-duplicates',
  'record.archive',
  'record.reinstate',
  'record.verify-certified',

  // register
  'record.register',

  // correct
  'record.request-correction',
  'record.correct',
  'record.request-revocation',
  'record.revoke',
  'record.request-reinstatement',
  'record.reinstate',

  // audit
  'record.read',
  'record.read-audit',
  'record.read-comments',
  'record.create-comments',

  // search
  'search.birth',
  'search.birth:my-jurisdiction',
  'search.death',
  'search.death:my-jurisdiction',
  'search.marriage',
  'search.marriage:my-jurisdiction',

  // profile
  'profile.update-signature',
  'profile.update-phone-number',
  'profile.update-name',
  'profile.update-profile-image',

  // performance
  'performance.read',
  'performance.read-dashboards',
  'performance.export-vital-statistics',

  // organisation
  'organisation.read',
  'organisation.read-locations:my-office',
  'organisation.read-locations:all',

  // user
  'user.read:all',
  'user.read:my-office',
  'user.create',
  'user.update',
  'user.update:resend-invite',
  'user.update:reset-password',
  'user.update:deactivate-reactivate'
] as const

export type Scope = (typeof scopes)[number]
