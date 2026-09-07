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
import { MessageDescriptor } from 'react-intl'
import { defineScopes, EncodedScope } from '@opencrvs/toolkit/scopes'

type Role = {
  id: string
  label: MessageDescriptor
  scopes: EncodedScope[]
}

export const roles: Role[] = [
  {
    id: 'REGISTRATION_AGENT',
    label: {
      defaultMessage: 'Registration Officer',
      description: 'Name for user role Registration Officer',
      id: 'userRole.registrationOfficer'
    },
    scopes: defineScopes([
      { type: 'performance.read' },
      { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.read', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.search', options: { accessLevel: 'administrativeArea' } },
      { type: 'performance.read-dashboards' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'requires-completion', 'in-external-validation', 'escalated', 'pending-validation', 'pending-updates', 'pending-approval', 'pending-certification', 'pending-issuance', 'correction-requested'] } },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea', flags: { noneOf: ['sealed'] } } },
      { type: 'record.create', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea', flags: { noneOf: ['sealed'] } } },
      { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.reject', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.archive', options: { declaredIn: 'administrativeArea' } },
      { type: 'record.archive', options: { notifiedIn: 'administrativeArea' } },
      { type: 'record.unarchive', options: { declaredIn: 'administrativeArea' } },
      { type: 'record.unarchive', options: { notifiedIn: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.request-correction', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['VALIDATE_DECLARATION', 'ESCALATE'] } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['REINSTATE_REVOKE_REGISTRATION'], placeOfEvent: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ISSUE_CERTIFIED_COPY', 'ISSUE_VERIFIABLE_CREDENTIAL'] } },
      { type: 'record.custom-action', options: { event: ['death'], customActionTypes: ['VALIDATE_DECLARATION'] } },
      {
        type: 'dashboard.view',
        options: { ids: ['registrations', 'completeness', 'registry'] }
      }
    ])
  },
  {
    id: 'LOCAL_REGISTRAR',
    label: {
      defaultMessage: 'Registrar',
      description: 'Name for user role Registrar',
      id: 'userRole.localRegistrar'
    },
    scopes: defineScopes([
      { type: 'profile.electronic-signature' },
      { type: 'performance.read' },
      { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.read', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.search', options: { accessLevel: 'administrativeArea' } },
      { type: 'performance.read-dashboards' },
      {
        type: 'workqueue',
        options: { ids: ['assigned-to-you', 'recent', 'requires-completion', 'in-external-validation', 'escalated', 'potential-duplicate', 'pending-updates', 'pending-registration', 'pending-approval', 'pending-certification', 'pending-issuance', 'correction-requested'] }
      },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.create', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea', flags: { noneOf: ['sealed'] } } },
      { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.reject', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.archive', options: { declaredIn: 'administrativeArea' } },
      { type: 'record.unarchive', options: { declaredIn: 'administrativeArea' } },
      { type: 'record.review-duplicates', options: { placeOfEvent: 'administrativeArea', flags: { noneOf: ['sealed'] } } },
      { type: 'record.register', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.correct', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ESCALATE', 'REINSTATE_REVOKE_REGISTRATION'], placeOfEvent: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ISSUE_CERTIFIED_COPY', 'ISSUE_VERIFIABLE_CREDENTIAL'], registeredIn: 'administrativeArea' } },
      { type: 'record.unassign-others' },
      {
        type: 'dashboard.view',
        options: { ids: ['registrations', 'completeness', 'registry'] }
      }
    ])
  },
  {
    id: 'LOCAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'Administrator',
      description: 'Name for user role Administrator',
      id: 'userRole.administrator'
    },
    scopes: [
      ...defineScopes([
        { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
        { type: 'user.create', options: { accessLevel: 'administrativeArea', role: ['HOSPITAL_CLERK', 'HEALTH_ADMINISTRATOR', 'COMMUNITY_LEADER', 'REGISTRATION_AGENT', 'LOCAL_REGISTRAR', 'PROVINCIAL_REGISTRAR', 'FIELD_AGENT'] } },
        { type: 'user.edit', options: { accessLevel: 'administrativeArea', role: ['HOSPITAL_CLERK', 'HEALTH_ADMINISTRATOR', 'COMMUNITY_LEADER', 'REGISTRATION_AGENT', 'LOCAL_REGISTRAR', 'PROVINCIAL_REGISTRAR', 'FIELD_AGENT'] } },
        { type: 'user.read', options: { accessLevel: 'administrativeArea' } },
        { type: 'user.search', options: { accessLevel: 'administrativeArea' } }
      ])
    ]
  },
  {
    id: 'NATIONAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'National Administrator',
      description: 'Name for user role National Administrator',
      id: 'userRole.nationalAdministrator'
    },
    scopes: [
      ...defineScopes([
        { type: 'config.update-all' },
        { type: 'location.edit' },
        { type: 'organisation.read-locations' },
        {
          type: 'user.create',
          options: {
            role: ['HOSPITAL_CLERK', 'HEALTH_ADMINISTRATOR', 'COMMUNITY_LEADER', 'REGISTRATION_AGENT', 'LOCAL_REGISTRAR', 'NATIONAL_REGISTRAR', 'LOCAL_SYSTEM_ADMIN', 'NATIONAL_SYSTEM_ADMIN', 'PERFORMANCE_MANAGER', 'PROVINCIAL_REGISTRAR', 'EMBASSY_OFFICIAL', 'FIELD_AGENT']
          }
        },
        {
          type: 'user.edit',
          options: {
            role: ['HOSPITAL_CLERK', 'HEALTH_ADMINISTRATOR', 'COMMUNITY_LEADER', 'REGISTRATION_AGENT', 'LOCAL_REGISTRAR', 'NATIONAL_REGISTRAR', 'LOCAL_SYSTEM_ADMIN', 'NATIONAL_SYSTEM_ADMIN', 'PERFORMANCE_MANAGER', 'PROVINCIAL_REGISTRAR', 'EMBASSY_OFFICIAL', 'FIELD_AGENT']
          }
        },
        { type: 'user.read' },
        { type: 'user.search' },
        { type: 'performance.read' },
        { type: 'record.reindex' },
        { type: 'integration.create' },
        { type: 'performance.read-dashboards' },
        {
          type: 'dashboard.view',
          options: { ids: ['registrations', 'completeness', 'registry'] }
        }
      ])
    ]
  },
  {
    id: 'PERFORMANCE_MANAGER',
    label: {
      defaultMessage: 'Operations Manager',
      description: 'Name for user role Operations Manager',
      id: 'userRole.operationsManager'
    },
    scopes: defineScopes([
      { type: 'performance.read' },
      { type: 'organisation.read-locations' },
      { type: 'user.search' },
      { type: 'performance.read-dashboards' },
      {
        type: 'dashboard.view',
        options: { ids: ['registrations', 'completeness', 'registry'] }
      }
    ])
  },
  {
    id: 'NATIONAL_REGISTRAR',
    label: { defaultMessage: 'Registrar General', description: 'Name for user role Registrar General', id: 'userRole.registrarGeneral' },
    scopes: defineScopes([
      { type: 'profile.electronic-signature' },
      { type: 'performance.read' },
      { type: 'organisation.read-locations' },
      { type: 'user.read' },
      { type: 'user.search' },
      { type: 'record.search' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'pending-feedback-registrar-general', 'potential-duplicate', 'registration-registrar-general'] } },
      { type: 'record.read' },
      { type: 'record.create' },
      { type: 'record.edit' },
      { type: 'record.declare' },
      { type: 'record.reject' },
      { type: 'record.archive' },
      { type: 'record.unarchive' },
      { type: 'record.review-duplicates' },
      { type: 'record.register' },
      { type: 'record.print-certified-copies' },
      { type: 'record.correct' },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['SEAL', 'UNSEAL', 'REGISTRAR_GENERAL_FEEDBACK', 'REVOKE_REGISTRATION', 'REINSTATE_REVOKE_REGISTRATION', 'APPROVE_DECLARATION'] } },
      { type: 'record.custom-action', options: { event: ['death'], customActionTypes: ['APPROVE_DECLARATION'] } },
      { type: 'record.unassign-others' }
    ])
  },
  {
    id: 'PROVINCIAL_REGISTRAR',
    label: {
      defaultMessage: 'Provincial Registrar',
      description: 'Name for user role Provincial Registrar',
      id: 'userRole.provincialRegistrar'
    },
    scopes: defineScopes([
      { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.read', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.search', options: { accessLevel: 'administrativeArea' } },
      { type: 'performance.read' },
      { type: 'performance.read-dashboards' },
      { type: 'profile.electronic-signature' },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea', flags: { noneOf: ['sealed'] } } },
      { type: 'workqueue', options: { ids: ['recent', 'pending-feedback-provincinal-registrar', 'pending-approval', 'correction-requested'] } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea', flags: { noneOf: ['sealed'] } } },
      { type: 'record.reject', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.register', options: { declaredIn: 'administrativeArea' } },
      { type: 'record.archive', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.unarchive', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['PROVINCIAL_REGISTER_FEEDBACK', 'REINSTATE_REVOKE_REGISTRATION', 'ESCALATE'], placeOfEvent: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth', 'death'], customActionTypes: ['APPROVE_DECLARATION'], declaredIn: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.correct', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.unassign-others', options: { placeOfEvent: 'administrativeArea' } },
      {
        type: 'dashboard.view',
        options: { ids: ['registrations', 'completeness', 'registry'] }
      }
    ])
  },
  {
    id: 'HOSPITAL_CLERK',
    label: {
      defaultMessage: 'Hospital Official',
      description: 'Name for user role Hospital Official',
      id: 'userRole.hospitalClerk'
    },
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      { type: 'record.search', options: { placeOfEvent: 'location', flags: { noneOf: ['sealed'] } } },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'pending-attestation', 'pending-updates'] } },
      { type: 'record.create', options: { placeOfEvent: 'location' } },
      { type: 'record.read', options: { event: ['birth', 'death', 'adoption', 'tennis-club-membership'], placeOfEvent: 'location', flags: { noneOf: ['sealed'] } } },
      { type: 'record.edit', options: { status: ['NOTIFIED'] } },
      { type: 'record.notify', options: { placeOfEvent: 'location' } },
      { type: 'record.edit', options: { event: ['birth', 'death', 'adoption'], notifiedBy: 'user' } },
      { type: 'record.print-certified-copies', options: { templates: ['v2.tennis-club-membership-certificate-alpha'], registeredIn: 'location' } }
    ])
  },
  {
    id: 'HEALTH_ADMINISTRATOR',
    label: {
      defaultMessage: 'Health Administrator',
      description: 'Name for user role Health Administrator',
      id: 'userRole.healthAdministrator'
    },
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      { type: 'record.search', options: { placeOfEvent: 'location', flags: { noneOf: ['sealed'] } } },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'pending-attestation'] } },
      { type: 'record.read', options: { placeOfEvent: 'location', flags: { noneOf: ['sealed'] } } },
      { type: 'record.custom-action', options: { event: ['death'], customActionTypes: ['ATTEST'], placeOfEvent: 'location' } }
    ])
  },
  {
    id: 'COMMUNITY_LEADER',
    label: {
      defaultMessage: 'Community Leader',
      description: 'Name for user role Community Leader',
      id: 'userRole.communityLeader'
    },
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea', flags: { noneOf: ['sealed'] } } },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent'] } },
      { type: 'record.create', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea', flags: { noneOf: ['sealed'] } } },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.notify', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } }
    ])
  },
  {
    id: 'EMBASSY_OFFICIAL',
    label: {
      defaultMessage: 'Embassy Official',
      description: 'Name for user role Embassy Official',
      id: 'userRole.embassyOffical'
    },
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'escalated', 'pending-updates', 'pending-certification', 'potential-duplicate'] } },
      { type: 'record.search', options: { createdBy: 'user', flags: { noneOf: ['sealed'] } } },
      { type: 'record.create', options: { placeOfEvent: 'all' } },
      { type: 'record.read', options: { placeOfEvent: 'all', flags: { noneOf: ['sealed'] } } },
      { type: 'record.declare', options: { placeOfEvent: 'all' } },
      { type: 'record.edit', options: { placeOfEvent: 'all' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ESCALATE'], placeOfEvent: 'all' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ISSUE_CERTIFIED_COPY'], placeOfEvent: 'all' } },
      { type: 'record.print-certified-copies', options: { placeOfEvent: 'all' } },
      { type: 'record.correct', options: { placeOfEvent: 'all' } }
    ])
  },
  {
    id: 'QA_HOSPITAL_CLERK',
    label: {
      defaultMessage: 'QA Hospital Official',
      description: 'Name for user role QA Hospital Official. Used for regression testing',
      id: 'userRole.hospitalClerk'
    },
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      { type: 'record.search', options: { placeOfEvent: 'location', flags: { noneOf: ['sealed'] } } },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'pending-attestation', 'pending-updates'] } },
      { type: 'record.create', options: { placeOfEvent: 'location' } },
      { type: 'record.read', options: { event: ['birth', 'death', 'adoption', 'tennis-club-membership'], placeOfEvent: 'location', flags: { noneOf: ['sealed'] } } },
      { type: 'record.edit', options: { status: ['NOTIFIED'] } },
      { type: 'record.notify', options: { placeOfEvent: 'location' } },
      { type: 'record.declare', options: { placeOfEvent: 'location' } },
      { type: 'record.edit', options: { event: ['birth', 'death', 'adoption'], notifiedBy: 'user' } },
      { type: 'record.print-certified-copies', options: { templates: ['v2.tennis-club-membership-certificate-alpha'], registeredIn: 'location' } }
    ])
  },
  {
    /**
     * A test-only role, not part of any real country configuration — the same
     * intent as QA_HOSPITAL_CLERK above.
     *
     * It exists to exercise the `createdBy` scope filter added in
     * opencrvs-core#13288: `record.search` and `record.read` carry
     * `createdBy: 'user'`, so this agent only ever sees records it created
     * itself. The case worth verifying is that it keeps access after another
     * user re-declares the record with edits, which overwrites
     * `legalStatuses.DECLARED.createdBy`.
     *
     * See https://github.com/opencrvs/opencrvs-core/issues/13287
     */
    id: 'FIELD_AGENT',
    label: {
      defaultMessage: 'Field Agent',
      description: 'Name for user role Field Agent',
      id: 'userRole.fieldAgent'
    },
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'pending-validation'] } },
      { type: 'record.create', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea', createdBy: 'user' } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea', createdBy: 'user' } }
    ])
  }
]
