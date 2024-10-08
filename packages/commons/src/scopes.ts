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

export const SCOPES = {
  // TODO Remove legacy scopes
  NATLSYSADMIN: 'natlsysadmin',
  BYPASSRATELIMIT: 'bypassratelimit',

  DEMO: 'demo',
  DECLARE: 'declare',
  REGISTER: 'register',
  CERTIFY: 'certify',
  PERFORMANCE: 'performance',
  SYSADMIN: 'sysadmin',
  VALIDATE: 'validate',
  TEAMS: 'teams',
  CONFIG: 'config',

  // systems / integrations
  WEBHOOK: 'webhook',
  NATIONALID: 'nationalId',
  NOTIFICATION_API: 'notification-api',
  RECORDSEARCH: 'recordsearch',

  // declare
  RECORD_DECLARE_BIRTH_MY_JURISDICTION: 'record.declare-birth:my-jurisdiction',
  RECORD_DECLARE_BIRTH: 'record.declare-birth',
  RECORD_DECLARE_DEATH_MY_JURISDICTION: 'record.declare-death:my-jurisdiction',
  RECORD_DECLARE_DEATH: 'record.declare-death',
  RECORD_DECLARE_MARRIAGE_MY_JURISDICTION:
    'record.declare-marriage:my-jurisdiction',
  RECORD_DECLARE_MARRIAGE: 'record.declare-marriage',
  RECORD_SUBMIT_INCOMPLETE: 'record.submit-incomplete',
  RECORD_SUBMIT_FOR_REVIEW: 'record.submit-for-review',
  RECORD_ASSIGN_UNASSIGN_MYSELF: 'record.assign-unassign-myself',
  RECORD_UNASSIGN_OTHERS: 'record.unassign-others',

  // validate
  RECORD_DECLARATION_REVIEW: 'record.declaration-review',
  RECORD_DECLARATION_ARCHIVE: 'record.declaration-archive',
  RECORD_DECLARATION_REINSTATE: 'record.declaration-reinstate',
  RECORD_REVIEW_DUPLICATES: 'record.review-duplicates',
  RECORD_SUBMIT_FOR_APPROVAL: 'record.submit-for-approval',
  RECORD_SUBMIT_FOR_UPDATES: 'record.submit-for-updates',
  RECORD_REGISTRATION_VERIFY_CERTIFIED_COPIES:
    'record.registration-verify-certified-copies',

  // register
  RECORD_REGISTER: 'record.register',

  //   // certify
  RECORD_PRINT_RECORDS: 'record.print-records',
  RECORD_PRINT_RECORDS_SUPPORTING_DOCUMENTS:
    'record.print-records-supporting-documents',
  RECORD_EXPORT_RECORDS: 'record.export-records',
  RECORD_PRINT_ISSUE_CERTIFIED_COPIES: 'record.print-issue-certified-copies',
  RECORD_BULK_PRINT_CERTIFIED_COPIES: 'record.bulk-print-certified-copies',

  // correct
  RECORD_REGISTRATION_REQUEST_CORRECTION:
    'record.registration-request-correction',
  RECORD_REGISTRATION_CORRECT: 'record.registration-correct',
  RECORD_REGISTRATION_REQUEST_REVOCATION:
    'record.registration-request-revocation',
  RECORD_REGISTRATION_REVOKE: 'record.registration-revoke',
  RECORD_REGISTRATION_REQUEST_REINSTATEMENT:
    'record.registration-request-reinstatement',
  RECORD_REGISTRATION_REINSTATE: 'record.registration-reinstate',

  // search
  SEARCH_BIRTH_MY_JURISDICTION: 'search.birth:my-jurisdiction',
  SEARCH_BIRTH: 'search.birth',
  SEARCH_DEATH_MY_JURISDICTION: 'search.death:my-jurisdiction',
  SEARCH_DEATH: 'search.death',
  SEARCH_MARRIAGE_MY_JURISDICTION: 'search.marriage:my-jurisdiction',
  SEARCH_MARRIAGE: 'search.marriage',

  // audit
  RECORD_READ: 'record.read',
  RECORD_READ_AUDIT: 'record.read-audit',
  RECORD_READ_COMMENTS: 'record.read-comments',
  RECORD_CREATE_COMMENTS: 'record.create-comments',

  // profile
  PROFILE_UPDATE_SIGNATURE: 'profile.update-signature',
  PROFILE_UPDATE_PHONE_NUMBER: 'profile.update-phone-number',
  PROFILE_UPDATE_NAME: 'profile.update-name',
  PROFILE_UPDATE_PROFILE_IMAGE: 'profile.update-profile-image',

  // performance
  PERFORMANCE_READ_MY_OFFICE: 'performance.read:my-office',
  PERFORMANCE_READ: 'performance.read',
  PERFORMANCE_READ_DASHBOARDS: 'performance.read-dashboards',
  PERFORMANCE_EXPORT_VITAL_STATISTICS: 'performance.export-vital-statistics',

  // organisation
  ORGANISATION_READ: 'organisation.read',
  ORGANISATION_READ_LOCATIONS_MY_OFFICE:
    'organisation.read-locations:my-office',
  ORGANISATION_READ_LOCATIONS: 'organisation.read-locations',

  // user
  USER_READ_MY_OFFICE: 'user.read:my-office',
  USER_READ: 'user.read',
  USER_CREATE: 'user.create',
  USER_CREATE_MY_JURISDICTION: 'user.create:my-jurisdiction',
  USER_UPDATE_MY_OFFICE: 'user.update:my-office',
  USER_UPDATE: 'user.update'
} as const

export type Scope = (typeof SCOPES)[keyof typeof SCOPES]

export const scopes: Scope[] = Object.values(SCOPES)
