import {
  ActionStatus,
  ActionType,
  EventStatus,
  InherentFlags,
  defineWorkqueues,
  event,
  user
} from '@opencrvs/toolkit/events'

// Example of a column that is used in the workqueue config
// eslint-disable-next-line no-unused-vars
const DATE_OF_EVENT_COLUMN = {
  label: {
    id: 'workqueues.dateOfEvent',
    defaultMessage: 'Date of Event',
    description: 'Label for workqueue column: dateOfEvent'
  },
  value: event.field('dateOfEvent')
}

const createdInMyAdminArea = {
  createdAtLocation: {
    type: 'within',
    location: user('primaryOfficeId')
  }
} as const

const declaredInMyAdminArea = {
  ['legalStatuses.DECLARED.createdAtLocation']: {
    type: 'within',
    location: user('primaryOfficeId')
  }
} as const

const registeredInMyAdminArea = {
  ['legalStatuses.REGISTERED.createdAtLocation']: {
    type: 'within',
    location: user('primaryOfficeId')
  }
} as const

export const Workqueues = defineWorkqueues([
  {
    slug: 'assigned-to-you',
    icon: 'PushPin',
    name: {
      id: 'workqueues.assignedToYou.title',
      defaultMessage: 'Assigned to you',
      description: 'Title of assigned to you workqueue'
    },
    query: { assignedTo: { type: 'exact', term: user('id') } },
    action: { type: ActionType.READ }
  },
  {
    slug: 'recent',
    icon: 'Timer',
    name: {
      id: 'workqueues.recent.title',
      defaultMessage: 'Recent',
      description: 'Title of recent workqueue'
    },
    query: {
      updatedBy: { type: 'exact', term: user('id') },
      updatedAt: { type: 'timePeriod', term: 'last7Days' }
    },
    action: { type: ActionType.READ },
    emptyMessage: {
      id: 'workqueues.recent.emptyMessage',
      defaultMessage: 'No recent records',
      description: 'Empty message for recent workqueue'
    }
  },
  {
    slug: 'requires-completion',
    icon: 'FileDotted',
    name: {
      id: 'workqueues.notifications.title',
      defaultMessage: 'Notifications',
      description: 'Title of notifications workqueue'
    },
    query: {
      flags: {
        anyOf: [InherentFlags.INCOMPLETE],
        noneOf: [InherentFlags.REJECTED]
      },
      updatedAtLocation: { type: 'within', location: user('primaryOfficeId') }
    },
    action: { type: ActionType.READ },
    emptyMessage: {
      id: 'workqueues.notifications.emptyMessage',
      defaultMessage: 'No notifications',
      description: 'Empty message for notifications workqueue'
    }
  },
  {
    slug: 'pending-validation',
    icon: 'Stamp',
    name: {
      id: 'workqueues.pendingValidation.title',
      defaultMessage: 'Pending validation',
      description: 'Title of pending validation workqueue'
    },
    query: {
      ...declaredInMyAdminArea,
      status: { type: 'exact', term: EventStatus.enum.DECLARED },
      flags: {
        noneOf: [
          InherentFlags.REJECTED,
          'validated',
          InherentFlags.POTENTIAL_DUPLICATE
        ]
      }
    },
    action: { type: ActionType.READ }
  },

  {
    slug: 'potential-duplicate',
    icon: 'Files',
    name: {
      id: 'workqueues.potentialDuplicate.title',
      defaultMessage: 'Potential duplicate',
      description: 'Title of potential duplicate workqueue'
    },
    query: {
      ...declaredInMyAdminArea,
      flags: { anyOf: [InherentFlags.POTENTIAL_DUPLICATE] }
    },
    action: { type: ActionType.READ }
  },
  {
    slug: 'pending-updates',
    icon: 'FileX',
    name: {
      id: 'workqueues.pendingUpdates.title',
      defaultMessage: 'Pending updates',
      description: 'Title of pending updates workqueue'
    },
    query: {
      ...createdInMyAdminArea,
      flags: { anyOf: [InherentFlags.REJECTED] }
    },
    action: { type: ActionType.READ }
  },
  {
    slug: 'pending-approval',
    icon: 'Stamp',
    name: {
      id: 'workqueues.requiresApproval.title',
      defaultMessage: 'Pending approval',
      description: 'Title of Pending approval workqueue'
    },
    query: {
      ...declaredInMyAdminArea,
      status: { type: 'exact', term: EventStatus.enum.DECLARED },
      flags: {
        allOf: ['validated', 'approval-required-for-late-registration'],
        noneOf: [InherentFlags.POTENTIAL_DUPLICATE]
      }
    },
    action: { type: ActionType.READ }
  },
  {
    slug: 'pending-registration',
    icon: 'PenNib',
    name: {
      id: 'workqueues.pendingRegistration.title',
      defaultMessage: 'Pending registration',
      description: 'Title of pending registration workqueue'
    },
    query: {
      ...declaredInMyAdminArea,
      status: { type: 'exact', term: EventStatus.enum.DECLARED },
      flags: {
        anyOf: ['validated'],
        noneOf: [
          'approval-required-for-late-registration',
          InherentFlags.POTENTIAL_DUPLICATE
        ]
      }
    },
    action: { type: ActionType.READ }
  },
  {
    slug: 'registration-registrar-general',
    icon: 'PenNib',
    name: {
      id: 'workqueues.pendingRegistration.title',
      defaultMessage: 'Pending registration',
      description: 'Title of pending registration workqueue'
    },
    query: {
      status: { type: 'exact', term: EventStatus.enum.DECLARED },
      flags: { noneOf: [InherentFlags.POTENTIAL_DUPLICATE] },
      'legalStatuses.DECLARED.createdByRole': {
        type: 'anyOf',
        terms: ['EMBASSY_OFFICIAL']
      }
    },
    action: { type: ActionType.READ }
  },
  {
    slug: 'escalated',
    icon: 'FileArrowUp',
    name: {
      id: 'workqueues.escalated.title',
      defaultMessage: 'Escalated',
      description: 'Title of escalated workqueue'
    },
    query: {
      ...createdInMyAdminArea,
      flags: {
        anyOf: [
          'escalated-to-registrar-general',
          'escalated-to-provincial-registrar'
        ]
      }
    },
    action: { type: ActionType.READ }
  },
  {
    slug: 'pending-feedback-registrar-general',
    icon: 'ChatText',
    name: {
      id: 'workqueues.pendingFeedback.title',
      defaultMessage: 'Pending feedback',
      description: 'Title of pending feedback workqueue'
    },
    query: { flags: { anyOf: ['escalated-to-registrar-general'] } },
    action: { type: ActionType.READ }
  },
  {
    slug: 'pending-feedback-provincinal-registrar',
    icon: 'ChatText',
    name: {
      id: 'workqueues.pendingFeedback.title',
      defaultMessage: 'Pending feedback',
      description: 'Title of pending feedback workqueue'
    },
    query: { flags: { anyOf: ['escalated-to-provincial-registrar'] } },
    action: { type: ActionType.READ }
  },
  {
    slug: 'in-external-validation',
    icon: 'FileText',
    name: {
      id: 'workqueues.inExternalValidation.title',
      defaultMessage: 'Pending external validation',
      description: 'Title of pending external validation workqueue'
    },
    query: {
      flags: {
        anyOf: [
          `${ActionType.REGISTER}:${ActionStatus.Requested}`.toLowerCase()
        ]
      },
      updatedAtLocation: { type: 'within', location: user('primaryOfficeId') }
    },
    action: { type: ActionType.READ }
  },
  {
    slug: 'pending-certification',
    icon: 'Printer',
    name: {
      id: 'workqueues.pendingCertification.title',
      defaultMessage: 'Pending certification',
      description: 'Title of pending certification workqueue'
    },
    query: {
      ...registeredInMyAdminArea,
      flags: {
        anyOf: ['pending-first-certificate-issuance'],
        noneOf: ['revoked', InherentFlags.CORRECTION_REQUESTED]
      }
    },
    action: { type: ActionType.PRINT_CERTIFICATE },
    emptyMessage: {
      id: 'workqueues.pendingCertification.emptyMessage',
      defaultMessage: 'No pending certification records',
      description: 'Empty message for pending certification workqueue'
    }
  },
  {
    slug: 'pending-issuance',
    icon: 'Handshake',
    name: {
      id: 'workqueues.pendingIssuance.title',
      defaultMessage: 'Pending issuance',
      description: 'Title of pending issuance workqueue'
    },
    query: {
      ...registeredInMyAdminArea,
      flags: {
        anyOf: ['certified-copy-printed-in-advance-of-issuance'],
        noneOf: ['revoked', InherentFlags.CORRECTION_REQUESTED]
      }
    },
    action: { type: ActionType.READ },
    emptyMessage: {
      id: 'workqueues.pendingCertification.emptyMessage',
      defaultMessage: 'No pending certification records',
      description: 'Empty message for pending certification workqueue'
    }
  },
  {
    slug: 'correction-requested',
    icon: 'FilePlus',
    name: {
      id: 'workqueues.correctionRequested.title',
      defaultMessage: 'Pending corrections',
      description: 'Title of correction requested workqueue'
    },
    query: {
      ...registeredInMyAdminArea,
      flags: {
        anyOf: [InherentFlags.CORRECTION_REQUESTED],
        noneOf: ['revoked']
      }
    },
    action: { type: ActionType.READ }
  }
])
