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
import {
  ActionType,
  ConditionalType,
  defineConfig,
  or,
  user
} from '@opencrvs/toolkit/events'
import {
  ADOPTION_DECLARATION_FORM,
  ADOPTION_DECLARATION_REVIEW
} from './forms/declaration'
import { Event } from '@countryconfig/events/utils'

export const adoptionEvent = defineConfig({
  id: Event.Adoption,
  declaration: ADOPTION_DECLARATION_FORM,
  label: {
    defaultMessage: 'Adoption',
    description: 'This is what this event is referred as in the system',
    id: 'event.adoption.label'
  },
  title: {
    defaultMessage: '{child.name.firstname} {child.name.surname}',
    description: 'This is the title of the summary',
    id: 'event.adoption.title'
  },
  fallbackTitle: {
    id: 'event.adoption.fallbackTitle',
    defaultMessage: 'No name provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  summary: {
    fields: [
      {
        fieldId: 'child.brn',
        emptyValueMessage: {
          defaultMessage: 'No original birth record BRN',
          description: 'This is shown when there is no linked birth record',
          id: 'event.adoption.summary.child.brn.empty'
        }
      },
      {
        fieldId: 'child.dob',
        emptyValueMessage: {
          defaultMessage: 'No date of birth',
          description: 'This is shown when there is no child information',
          id: 'event.adoption.summary.child.dob.empty'
        }
      },
      {
        id: 'event.registeredAt',
        emptyValueMessage: {
          defaultMessage: 'No registration date',
          description: 'This is shown when there is no registration date',
          id: 'event.adoption.summary.event.registeredAt.empty'
        },
        label: {
          defaultMessage: 'Registration date',
          description: 'This is the label for the registration date',
          id: 'event.adoption.summary.event.registeredAt.label'
        },
        value: {
          defaultMessage:
            '{event.legalStatuses.REGISTERED.acceptedAt, date, ::dd MMMM yyyy}',
          description: 'This is the registration date value',
          id: 'event.adoption.summary.event.registeredAt.value'
        }
      }
    ]
  },
  flags: [
    {
      id: 'validated',
      label: {
        id: 'event.adoption.flag.validated',
        defaultMessage: 'Validated',
        description: 'Flag label for validated'
      },
      requiresAction: true
    }
  ],
  actionOrder: [
    ActionType.ASSIGN,
    ActionType.REGISTER,
    ActionType.DECLARE,
    ActionType.EDIT,
    ActionType.REJECT,
    ActionType.ARCHIVE,
    ActionType.UNARCHIVE,
    ActionType.UNASSIGN
  ],
  actions: [
    {
      type: ActionType.READ,
      label: {
        defaultMessage: 'Read',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.adoption.action.Read.label'
      },
      review: ADOPTION_DECLARATION_REVIEW
    },
    {
      type: ActionType.NOTIFY,
      label: {
        defaultMessage: 'Notify',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.adoption.action.notify.label'
      },
      form: [
        {
          id: 'comments',
          type: 'TEXTAREA',
          label: {
            defaultMessage: 'Additional comments',
            description:
              'This is the label for the additional comments field on the notify action dialog',
            id: 'event.adoption.action.notify.field.comments.label'
          }
        }
      ]
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.adoption.action.declare.label'
      },
      review: ADOPTION_DECLARATION_REVIEW,
      flags: [
        {
          id: 'validated',
          operation: 'add',
          conditional: or(
            user.hasRole('REGISTRATION_AGENT'),
            user.hasRole('LOCAL_REGISTRAR')
          )
        }
      ]
    },
    {
      type: ActionType.EDIT,
      label: {
        defaultMessage: 'Edit',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'actions.edit'
      },
      flags: [{ id: 'validated', operation: 'remove' }],
      dialogCopy: {
        notify: {
          id: 'event.adoption.action.edit.notify.copy',
          defaultMessage:
            'Are you sure you want to notify this event with these edits?',
          description: 'Confirmation text for the notify with edits action'
        },
        declare: {
          id: 'event.adoption.action.edit.declare.copy',
          defaultMessage:
            'Are you sure you want to edit this declaration? By confirming you are redeclaring this event and override past changes.',
          description: 'Confirmation text for the declare with edits action'
        },
        register: {
          id: 'event.adoption.action.edit.register.copy',
          defaultMessage:
            'You are about to register this adoption with your edits. Please ensure all details are correct before proceeding.',
          description: 'Confirmation text for the register with edits action'
        }
      }
    },
    {
      type: ActionType.REJECT,
      label: {
        defaultMessage: 'Reject',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.adoption.action.reject.label'
      },
      supportingCopy: {
        id: 'rejectModal.description',
        defaultMessage:
          'Rejecting this declaration will return it to the submitter for updates. Please ensure a valid reason for rejection has been recorded.',
        description: 'The description for reject modal'
      },
      flags: [{ id: 'validated', operation: 'remove' }]
    },
    {
      type: ActionType.REGISTER,
      label: {
        defaultMessage: 'Register',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.adoption.action.register.label'
      },
      supportingCopy: {
        id: 'event.adoption.action.register.supportingCopy',
        description: 'Confirmation text for the register action',
        defaultMessage:
          'Registering this adoption will create an official civil registration record and seal the original birth record.'
      },
      flags: [{ id: 'validated', operation: 'remove' }]
    },
    {
      type: ActionType.ARCHIVE,
      label: {
        defaultMessage: 'Archive',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.adoption.action.archive.label'
      },
      supportingCopy: {
        id: 'recordAudit.archive.confirmation.body',
        defaultMessage:
          'Archiving will remove this declaration from active processing while retaining it for record purposes. Archived declarations cannot be modified unless reinstated.',
        description: 'Confirmation body for archiving a declaration'
      }
    },
    {
      type: ActionType.UNARCHIVE,
      label: {
        defaultMessage: 'Unarchive',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.adoption.action.unarchive.label'
      },
      supportingCopy: {
        id: 'recordAudit.unarchive.confirmation.body',
        defaultMessage:
          'This record will become active again and will be able to progress through registration.',
        description: 'Confirmation body for unarchiving a declaration'
      }
    }
  ]
})
