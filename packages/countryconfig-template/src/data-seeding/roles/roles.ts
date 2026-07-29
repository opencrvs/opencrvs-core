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
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.create', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.reject', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.archive', options: { declaredIn: 'administrativeArea' } },
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
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.reject', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.archive', options: { declaredIn: 'administrativeArea' } },
      { type: 'record.review-duplicates', options: { placeOfEvent: 'administrativeArea' } },
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
        { type: 'user.create', options: { accessLevel: 'administrativeArea', role: ['HOSPITAL_CLERK', 'COMMUNITY_LEADER', 'REGISTRATION_AGENT', 'LOCAL_REGISTRAR', 'PROVINCIAL_REGISTRAR'] } },
        { type: 'user.edit', options: { accessLevel: 'administrativeArea', role: ['HOSPITAL_CLERK', 'COMMUNITY_LEADER', 'REGISTRATION_AGENT', 'LOCAL_REGISTRAR', 'PROVINCIAL_REGISTRAR'] } },
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
        { type: 'organisation.read-locations' },
        { type: 'user.create', options: { role: ['HOSPITAL_CLERK', 'COMMUNITY_LEADER', 'REGISTRATION_AGENT', 'LOCAL_REGISTRAR', 'NATIONAL_REGISTRAR', 'LOCAL_SYSTEM_ADMIN', 'NATIONAL_SYSTEM_ADMIN', 'PERFORMANCE_MANAGER', 'PROVINCIAL_REGISTRAR', 'EMBASSY_OFFICIAL'] } },
        { type: 'user.edit', options: { role: ['HOSPITAL_CLERK', 'COMMUNITY_LEADER', 'REGISTRATION_AGENT', 'LOCAL_REGISTRAR', 'NATIONAL_REGISTRAR', 'LOCAL_SYSTEM_ADMIN', 'NATIONAL_SYSTEM_ADMIN', 'PERFORMANCE_MANAGER', 'PROVINCIAL_REGISTRAR', 'EMBASSY_OFFICIAL'] } },
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
      { type: 'record.declare' },
      { type: 'record.reject' },
      { type: 'record.archive' },
      { type: 'record.review-duplicates' },
      { type: 'record.register' },
      { type: 'record.print-certified-copies' },
      { type: 'record.correct' },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['REGISTRAR_GENERAL_FEEDBACK', 'REVOKE_REGISTRATION', 'REINSTATE_REVOKE_REGISTRATION', 'APPROVE_DECLARATION'] } },
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
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'workqueue', options: { ids: ['recent', 'pending-feedback-provincinal-registrar', 'pending-approval', 'correction-requested'] } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.reject', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.register', options: { declaredIn: 'administrativeArea' } },
      { type: 'record.archive', options: { placeOfEvent: 'administrativeArea' } },
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
      { type: 'record.search', options: { placeOfEvent: 'location' } },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'pending-updates'] } },
      { type: 'record.create', options: { placeOfEvent: 'location' } },
      { type: 'record.read', options: { placeOfEvent: 'location' } },
      { type: 'record.declare', options: { placeOfEvent: 'location' } },
      { type: 'record.notify', options: { placeOfEvent: 'location' } },
      { type: 'record.edit', options: { placeOfEvent: 'location', declaredBy: 'user' } },
      { type: 'record.print-certified-copies', options: { templates: ['v2.tennis-club-membership-certificate-alpha'], registeredIn: 'location' } }
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
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent'] } },
      { type: 'record.create', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.notify', options: { placeOfEvent: 'administrativeArea' } }
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
      { type: 'record.search', options: { placeOfEvent: 'location' } },
      { type: 'record.create', options: { placeOfEvent: 'location' } },
      { type: 'record.read', options: { placeOfEvent: 'location' } },
      { type: 'record.declare', options: { placeOfEvent: 'location' } },
      { type: 'record.edit', options: { placeOfEvent: 'location' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ESCALATE'], placeOfEvent: 'location' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ISSUE_CERTIFIED_COPY'], placeOfEvent: 'location' } },
      { type: 'record.print-certified-copies', options: { placeOfEvent: 'location' } },
      { type: 'record.correct', options: { placeOfEvent: 'location' } }
    ])
  }
]
