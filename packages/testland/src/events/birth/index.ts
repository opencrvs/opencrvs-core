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
  and,
  ConditionalType,
  defineConfig,
  DocumentMimeType,
  event,
  EventStatus,
  field,
  FieldType,
  flag,
  ImageMimeType,
  InherentFlags,
  not,
  or,
  status,
  user
} from '@opencrvs/toolkit/events'
import {
  BIRTH_DECLARATION_FORM,
  BIRTH_DECLARATION_REVIEW
} from './forms/declaration'
import { advancedSearchBirth } from './advancedSearch'

import { BIRTH_CERTIFICATE_COLLECTOR_FORM } from './forms/printForm'
import { PlaceOfBirth } from './forms/pages/child'
import { CORRECTION_FORM } from './forms/correctionForm'
import { dedupConfig } from './dedupConfig'
import * as verifiableCredentialActions from '@countryconfig/verifiable-credentials/issue-birth-credential-action'
import {
  Event,
  BIRTH_LATE_REGISTRATION_TARGET_DAYS
} from '@countryconfig/events/utils'

export const birthEvent = defineConfig({
  id: Event.Birth,
  declaration: BIRTH_DECLARATION_FORM,
  label: {
    defaultMessage: 'Birth',
    description: 'This is what this event is referred as in the system',
    id: 'event.birth.label'
  },
  dateOfEvent: field('child.dob'),
  placeOfEvent: field('child.birthLocationId'),
  title: {
    defaultMessage: '{child.name.firstname} {child.name.surname}',
    description: 'This is the title of the summary',
    id: 'event.birth.title'
  },
  icon: {
    FileLock: and(
      event.hasStatus(EventStatus.enum.REGISTERED),
      event.hasFlag('sealed')
    )
  },
  fallbackTitle: {
    id: 'event.tennis-club-membership.fallbackTitle',
    defaultMessage: 'No name provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  flags: [
    {
      id: 'approval-required-for-late-registration',
      label: {
        id: 'event.birth.flag.approval-required-for-late-registration',
        defaultMessage: 'Approval required for late registration',
        description: 'Flag label for approval required for late registration'
      },
      requiresAction: true
    },
    {
      id: 'escalated-to-provincial-registrar',
      label: {
        id: 'event.birth.flag.escalated-to-provincial-registrar',
        defaultMessage: 'Escalated to Provincial Registrar',
        description: 'Flag label for escalated to provincial registrar'
      },
      requiresAction: true
    },
    {
      id: 'escalated-to-registrar-general',
      label: {
        id: 'event.birth.flag.escalated-to-registrar-general',
        defaultMessage: 'Escalated to Registrar General',
        description: 'Flag label for escalated to registrar general'
      },
      requiresAction: true
    },
    {
      id: 'validated',
      label: {
        id: 'event.birth.flag.validated',
        defaultMessage: 'Validated',
        description: 'Flag label for validated'
      },
      requiresAction: true
    },
    {
      id: 'pending-first-certificate-issuance',
      label: {
        id: 'event.birth.flag.pending-first-certificate-issuance',
        defaultMessage: 'Pending first certificate issuance',
        description: 'Flag label for first certificate issuance'
      },
      requiresAction: true
    },
    {
      id: 'certified-copy-printed-in-advance-of-issuance',
      label: {
        id: 'event.birth.flag.certified-copy-printed-in-advance-of-issuance',
        defaultMessage: 'Certified copy printed in advance of issuance',
        description:
          'Flag label for certified copy printed in advance of issuance'
      },
      requiresAction: true
    },
    {
      id: 'revoked',
      label: {
        id: 'event.birth.flag.revoked',
        defaultMessage: 'Revoked',
        description: 'Flag label for revoked'
      },
      requiresAction: true
    },
    {
      id: 'vc-issued',
      label: {
        defaultMessage: 'Verifiable Credential issued',
        description: 'Flag label for verifiable credential issued',
        id: 'event.birth.flag.vc-issued'
      },
      requiresAction: false
    },
    {
      id: 'corrected-record',
      label: {
        id: 'event.birth.flag.corrected-record',
        defaultMessage: 'Corrected record',
        description: 'Flag label for corrected record'
      },
      requiresAction: false
    },
    {
      id: 'sealed',
      label: {
        id: 'event.birth.flag.sealed',
        defaultMessage: 'Sealed',
        description: 'Flag label for sealed'
      },
      requiresAction: false
    }
  ],
  summary: {
    banners: [
      {
        type: 'negative',
        icon: 'FileLock',
        heading: {
          id: 'event.birth.summary.banner.sealed.title',
          defaultMessage: 'Record is protected',
          description: 'Heading of the info box shown when a record is sealed'
        },
        description: {
          id: 'event.birth.summary.banner.sealed.description',
          defaultMessage: 'Request to unseal to view this record',
          description: 'Description of the banner shown when a record is sealed'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: flag('sealed')
          }
        ]
      }
    ],
    fields: [
      {
        fieldId: 'child.nid',
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              not(field('child.nid').isFalsy()),
              not(flag('sealed'))
            )
          }
        ]
      },
      {
        fieldId: 'child.dob',
        emptyValueMessage: {
          defaultMessage: 'No date of birth',
          description: 'This is shown when there is no child information',
          id: 'event.birth.summary.child.dob.empty'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: not(flag('sealed'))
          }
        ]
      },
      // Render the 'fallback value' when selection has not been made.
      // This hides the default values of the field when no selection has been made. (e.g. when address is prefilled with user's details, we don't want to show the address before selecting the option)
      {
        fieldId: 'child.placeOfBirth',
        emptyValueMessage: {
          defaultMessage: 'No place of birth',
          description: 'This is shown when there is no child information',
          id: 'event.birth.summary.child.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of birth',
          description: 'Label for place of birth',
          id: 'event.birth.summary.child.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              not(flag('sealed')),
              field('child.placeOfBirth').isFalsy()
            )
          }
        ]
      },
      {
        fieldId: 'child.birthLocation',
        emptyValueMessage: {
          defaultMessage: 'No place of birth',
          description: 'This is shown when there is no child information',
          id: 'event.birth.summary.child.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of birth',
          description: 'Label for place of birth',
          id: 'event.birth.summary.child.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              not(flag('sealed')),
              field('child.placeOfBirth').isEqualTo(
                PlaceOfBirth.HEALTH_FACILITY
              )
            )
          }
        ]
      },
      {
        fieldId: 'child.birthLocation.privateHome',
        emptyValueMessage: {
          defaultMessage: 'No place of birth',
          description: 'This is shown when there is no child information',
          id: 'event.birth.summary.child.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of birth',
          description: 'Label for place of birth',
          id: 'event.birth.summary.child.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              not(flag('sealed')),
              field('child.placeOfBirth').isEqualTo(PlaceOfBirth.PRIVATE_HOME)
            )
          }
        ]
      },
      {
        fieldId: 'child.birthLocation.other',
        emptyValueMessage: {
          defaultMessage: 'No place of birth',
          description: 'This is shown when there is no child information',
          id: 'event.birth.summary.child.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of birth',
          description: 'Label for place of birth',
          id: 'event.birth.summary.child.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              not(flag('sealed')),
              field('child.placeOfBirth').isEqualTo(PlaceOfBirth.OTHER)
            )
          }
        ]
      },
      {
        id: 'informant.contact',
        emptyValueMessage: {
          defaultMessage: 'No contact details provided',
          description: 'This is shown when there is no informant information',
          id: 'event.birth.summary.informant.contact.empty'
        },
        label: {
          defaultMessage: 'Contact',
          description: 'This is the label for the informant information',
          id: 'event.birth.summary.informant.contact.label'
        },
        value: {
          defaultMessage: '{informant.phoneNo} {informant.email}',
          description: 'This is the contact value of the informant',
          id: 'event.birth.summary.informant.contact.value'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: not(flag('sealed'))
          }
        ]
      }
    ]
  },
  actionOrder: [
    ActionType.ASSIGN,
    ActionType.REGISTER,
    ActionType.DECLARE,
    ActionType.EDIT,
    'VALIDATE_DECLARATION',
    'APPROVE_DECLARATION',
    ActionType.MARK_AS_DUPLICATE,
    'ESCALATE',
    'PROVINCIAL_REGISTER_FEEDBACK',
    'REGISTRAR_GENERAL_FEEDBACK',
    ActionType.REJECT,
    ActionType.ARCHIVE,
    ActionType.UNARCHIVE,
    ActionType.DELETE,
    ActionType.PRINT_CERTIFICATE,
    'ISSUE_CERTIFIED_COPY',
    ActionType.REQUEST_CORRECTION,
    'REVOKE_REGISTRATION',
    'REINSTATE_REVOKE_REGISTRATION',
    'ISSUE_VERIFIABLE_CREDENTIAL',
    ActionType.UNASSIGN,
    'SEAL',
    'UNSEAL'
  ],
  actions: [
    {
      type: ActionType.READ,
      label: {
        defaultMessage: 'Read',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.Read.label'
      },
      review: BIRTH_DECLARATION_REVIEW
    },
    {
      type: ActionType.NOTIFY,
      label: {
        defaultMessage: 'Notify',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.notify.label'
      },
      form: [
        {
          id: 'comments',
          type: 'TEXTAREA',
          label: {
            defaultMessage: 'Additional comments',
            description:
              'This is the label for the additional comments field on the notify action dialog',
            id: 'event.birth.action.notify.field.comments.label'
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
        id: 'event.birth.action.declare.label'
      },
      form: [
        {
          id: 'comments',
          type: 'TEXTAREA',
          label: {
            defaultMessage: 'Additional comments',
            description:
              'This is the label for the additional comments field on the declare action dialog',
            id: 'event.birth.action.declare.field.comments.label'
          }
        }
      ],
      review: BIRTH_DECLARATION_REVIEW,
      deduplication: {
        id: 'birth-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.birth.action.detect-duplicate.label'
        },
        query: dedupConfig
      },
      flags: [
        {
          id: 'approval-required-for-late-registration',
          operation: 'add',
          conditional: and(
            not(
              field('child.dob')
                .isAfter()
                .days(BIRTH_LATE_REGISTRATION_TARGET_DAYS)
                .inPast()
            ),
            field('child.dob').isBefore().now()
          )
        },
        {
          id: 'validated',
          operation: 'add',
          conditional: or(
            user.hasRole('REGISTRATION_AGENT'),
            user.hasRole('LOCAL_REGISTRAR'),
            user.hasRole('EMBASSY_OFFICIAL')
          )
        }
      ],
      dialogCopy: {
        notify: {
          id: 'event.birth.action.declare.notify.copy',
          defaultMessage:
            'You are about to formally notify the relevant Registration Office that a new birth event has occurred. Please confirm that the information provided is accurate before proceeding.',
          description: 'Confirmation text for the notify action'
        },
        declare: {
          id: 'event.birth.action.declare.declare.copy',
          defaultMessage:
            'You are about to formally declare this birth event. Once declared, the record will enter the verification and approval process.',
          description: 'Confirmation text for the declare action'
        },
        register: {
          id: 'event.birth.action.declare.register.copy',
          defaultMessage:
            '<strong>WARNING!</strong>: By clicking "Register", you confirm that you have reviewed the record alongside supporting documentation in the Record tab. The record will proceed to be <strong>legally registered</strong> via the outbox. Further amends after registration can only be made via a legal correction process.',
          description: 'Confirmation text for the register action'
        }
      }
    },
    {
      type: ActionType.EDIT,
      label: {
        defaultMessage: 'Edit',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'actions.edit'
      },
      flags: [
        { id: 'validated', operation: 'remove' },
        { id: 'approval-required-for-late-registration', operation: 'remove' },
        { id: 'escalated-to-provincial-registrar', operation: 'remove' },
        { id: 'escalated-to-registrar-general', operation: 'remove' }
      ],
      dialogCopy: {
        notify: {
          id: 'event.birth.action.edit.notify.copy',
          defaultMessage:
            'Are you sure you want to notify this event with these edits?',
          description: 'Confirmation text for the notify with edits action'
        },
        declare: {
          id: 'event.birth.action.edit.declare.copy',
          defaultMessage:
            'Are you sure you want to edit this declaration? By confirming you are redeclaring this event and override past changes.',
          description: 'Confirmation text for the declare with edits action'
        },
        register: {
          id: 'event.birth.action.edit.register.copy',
          defaultMessage:
            'You are about to register this birth event with your edits. Please ensure all details are correct before proceeding.<br></br><br></br><strong>WARNING!</strong>: By continuing, you confirm that you have reviewed the record alongside supporting documentation. The record will proceed to be <strong>legally registered</strong> via the outbox. Further amends after registration can only be made via a legal correction process.',
          description: 'Confirmation text for the register with edits action'
        }
      }
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'VALIDATE_DECLARATION',
      icon: 'Stamp',
      label: {
        defaultMessage: 'Validate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.custom.action.validate-declaration.label'
      },
      supportingCopy: {
        defaultMessage:
          'Validating this declaration confirms it meets all requirements and is eligible for registration.',
        description:
          'This is the supporting copy for the Validate declaration -action',
        id: 'event.birth.custom.action.validate-declaration.supportingCopy'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(status('DECLARED'), not(flag('validated')))
        },
        {
          type: ConditionalType.ENABLE,
          conditional: not(flag(InherentFlags.POTENTIAL_DUPLICATE))
        }
      ],
      flags: [
        { id: 'validated', operation: 'add' },
        { id: InherentFlags.REJECTED, operation: 'remove' }
      ],
      form: [
        {
          id: 'comments',
          type: 'TEXTAREA',
          label: {
            defaultMessage: 'Comments',
            description:
              'This is the label for the comments field for the validate declaration action',
            id: 'event.birth.custom.action.validate-declaration.field.comments.label'
          }
        }
      ],
      auditHistoryLabel: {
        defaultMessage: 'Validated',
        description:
          'The label to show in audit history for the validate action',
        id: 'event.birth.custom.action.validate-declaration.audit-history-label'
      }
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'APPROVE_DECLARATION',
      icon: 'Stamp',
      label: {
        defaultMessage: 'Approve',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.approve.label'
      },
      form: [
        {
          id: 'notes',
          type: 'TEXTAREA',
          label: {
            defaultMessage: 'Comments',
            description: 'This is the label for the field for a custom action',
            id: 'event.birth.custom.action.approve.field.notes.label'
          }
        }
      ],
      flags: [
        { id: InherentFlags.REJECTED, operation: 'remove' },
        { id: 'approval-required-for-late-registration', operation: 'remove' }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            flag('approval-required-for-late-registration'),
            not(status('ARCHIVED'))
          )
        },
        {
          type: ConditionalType.ENABLE,
          conditional: not(flag(InherentFlags.POTENTIAL_DUPLICATE))
        }
      ],
      auditHistoryLabel: {
        defaultMessage: 'Approved',
        description:
          'The label to show in audit history for the approve action',
        id: 'event.birth.action.approve.audit-history-label'
      },
      supportingCopy: {
        defaultMessage:
          'Approving this declaration confirms it as legally accepted and eligible for registration.',
        description: 'This is the confirmation text for the approve action',
        id: 'event.birth.action.approve.confirmationText'
      }
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'ISSUE_CERTIFIED_COPY',
      icon: 'Handshake',
      label: {
        defaultMessage: 'Issue certified copy',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.issue-certified-copy.label'
      },
      supportingCopy: {
        defaultMessage:
          'Issuing a certified copy confirms that an official document is being released.',
        description:
          'This is the confirmation text for the issue certified copy action',
        id: 'event.birth.action.issue-certified-copy.supportingCopy'
      },
      form: [
        {
          id: 'collector',
          type: FieldType.SELECT,
          label: {
            defaultMessage: 'Collector',
            description: 'Label for collector field',
            id: 'event.birth.custom.action.approve.field.collector.label'
          },
          required: true,
          options: [
            {
              label: {
                defaultMessage: 'Mother',
                id: 'form.field.label.app.whoContDet.mother',
                description: 'Label for mother'
              },
              value: 'MOTHER'
            },
            {
              label: {
                defaultMessage: 'Father',
                id: 'form.field.label.informantRelation.father',
                description: 'Label for father'
              },
              value: 'FATHER'
            },
            {
              label: {
                defaultMessage: 'Someone else',
                id: 'form.field.label.informantRelation.others',
                description: 'Label for someone else'
              },
              value: 'SOMEONE_ELSE'
            }
          ]
        }
      ],
      flags: [
        { id: 'pending-first-certificate-issuance', operation: 'remove' },
        {
          id: 'certified-copy-printed-in-advance-of-issuance',
          operation: 'remove'
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            flag('certified-copy-printed-in-advance-of-issuance'),
            status('REGISTERED'),
            not(flag('revoked'))
          )
        }
      ],
      auditHistoryLabel: {
        defaultMessage: 'Issued',
        description: 'The label to show in audit history for the issued action',
        id: 'event.birth.action.issued.audit-history-label'
      }
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'ESCALATE',
      icon: 'FileArrowUp',
      label: {
        defaultMessage: 'Escalate',
        description:
          'This is shown when the escalate action can be triggered from the action from',
        id: 'event.birth.action.escalate.label'
      },
      supportingCopy: {
        defaultMessage:
          'Escalating this declaration will forward it to the chosen authority for further review and decision.',
        description: 'This is the confirmation text for the escalate action',
        id: 'event.birth.action.escalate.supportingCopy'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            or(
              flag('escalated-to-provincial-registrar'),
              flag('escalated-to-registrar-general')
            )
          )
        }
      ],
      form: [
        {
          id: 'escalate-to',
          type: FieldType.SELECT,
          required: true,
          label: {
            defaultMessage: 'Escalate to',
            description: 'This is the label for escalate to field',
            id: 'event.birth.custom.action.escalate.field.escalate-to.label'
          },
          options: [
            {
              label: {
                id: 'event.birth.custom.action.escalate.field.escalate-to.option.officer-in-charge.label',
                defaultMessage: 'My state provincial registrar',
                description:
                  'Option label for provincial registrar in escalate to field'
              },
              value: 'PROVINCIAL_REGISTRAR',
              conditionals: [
                {
                  type: ConditionalType.SHOW,
                  conditional: not(
                    or(
                      user.hasRole('EMBASSY_OFFICIAL'),
                      user.hasRole('PROVINCIAL_REGISTRAR')
                    )
                  )
                }
              ]
            },
            {
              label: {
                id: 'event.birth.custom.action.escalate.field.escalate-to.option.registrar-general.label',
                defaultMessage: 'Registrar General',
                description:
                  'Option label for registrar general in escalate to field'
              },
              value: 'REGISTRAR_GENERAL'
            }
          ]
        },
        {
          id: 'reason',
          type: FieldType.TEXTAREA,
          required: true,
          label: {
            defaultMessage: 'Reason',
            description: 'This is the label for reason field',
            id: 'form.field.label.reasonNotApplying'
          }
        }
      ],
      flags: [
        {
          id: 'escalated-to-provincial-registrar',
          operation: 'add',
          conditional: field('escalate-to').isEqualTo('PROVINCIAL_REGISTRAR')
        },
        {
          id: 'escalated-to-registrar-general',
          operation: 'add',
          conditional: field('escalate-to').isEqualTo('REGISTRAR_GENERAL')
        }
      ],
      auditHistoryLabel: {
        defaultMessage: 'Escalated',
        description:
          'The label to show in audit history for the escalate action',
        id: 'event.birth.action.escalate.audit-history-label'
      }
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'PROVINCIAL_REGISTER_FEEDBACK',
      icon: 'ChatText',
      supportingCopy: {
        defaultMessage:
          'Your feedback will be recorded and shared with relevant officers to guide further action on this declaration.',
        description:
          'This is the confirmation text for the provincial registrar feedback action',
        id: 'event.birth.action.provincial-registrar-feedback.supportingCopy'
      },
      label: {
        defaultMessage: 'Provincial registrar feedback',
        description:
          'This is shown when the provincial registrar feedback can be triggered from the action from',
        id: 'event.birth.action.provincial-registrar-feedback.label'
      },
      form: [
        {
          id: 'notes',
          type: 'TEXTAREA',
          required: true,
          label: {
            defaultMessage: 'Comments',
            description: 'This is the label for the field for a custom action',
            id: 'event.birth.custom.action.approve.field.notes.label'
          }
        }
      ],
      flags: [
        {
          id: 'escalated-to-provincial-registrar',
          operation: 'remove'
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: flag('escalated-to-provincial-registrar')
        }
      ],
      auditHistoryLabel: {
        defaultMessage: 'Escalation feedback',
        description:
          'The label to show in audit history for the registrar feedback sent action',
        id: 'event.birth.action.registrar-feedback.audit-history-label'
      }
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'REGISTRAR_GENERAL_FEEDBACK',
      icon: 'ChatText',
      label: {
        defaultMessage: 'Registrar general feedback',
        description:
          'This is shown when the registrar general feedback can be triggered from the action from',
        id: 'event.birth.action.registrar-general-feedback.label'
      },
      supportingCopy: {
        defaultMessage:
          'Your feedback will be officially recorded and may influence the final decision on the declaration.',
        description:
          'This is the confirmation text for the registrar general feedback action',
        id: 'event.birth.action.registrar-general-feedback.supportingCopy'
      },
      form: [
        {
          id: 'notes',
          type: 'TEXTAREA',
          required: true,
          label: {
            defaultMessage: 'Comments',
            description: 'This is the label for the field for a custom action',
            id: 'event.birth.custom.action.approve.field.notes.label'
          }
        }
      ],
      flags: [
        {
          id: 'escalated-to-registrar-general',
          operation: 'remove'
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: flag('escalated-to-registrar-general')
        }
      ],
      auditHistoryLabel: {
        defaultMessage: 'Escalation feedback',
        description:
          'The label to show in audit history for the registrar feedback sent action',
        id: 'event.birth.action.registrar-feedback.audit-history-label'
      }
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'REVOKE_REGISTRATION',
      label: {
        defaultMessage: 'Revoke registration',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.revoke-registration.label'
      },
      icon: 'Briefcase',
      supportingCopy: {
        defaultMessage:
          'Revoking this registration will invalidate the record and prevent its use for official purposes. This action should only be taken under lawful authority.',
        description:
          'This is the confirmation text for the revoke registration action',
        id: 'event.birth.action.revoke-registration.supportingCopy'
      },
      auditHistoryLabel: {
        defaultMessage: 'Revoked',
        description:
          'The label to show in audit history for the revoke registration action',
        id: 'event.birth.action.revoke-registration.audit-history-label'
      },
      flags: [
        { id: 'revoked', operation: 'add' },
        { id: 'pending-first-certificate-issuance', operation: 'remove' },
        { id: 'escalated-to-registrar-general', operation: 'remove' },
        { id: 'escalated-to-provincial-registrar', operation: 'remove' },
        {
          id: 'certified-copy-printed-in-advance-of-issuance',
          operation: 'remove'
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            status('REGISTERED'),
            not(flag(InherentFlags.CORRECTION_REQUESTED)),
            not(flag('revoked'))
          )
        }
      ],
      form: [
        {
          id: 'reason',
          type: 'TEXTAREA',
          required: true,
          label: {
            defaultMessage: 'Reason',
            description:
              'This is the label for the reason field for revoke registration action',
            id: 'event.birth.custom.action.revoke-registration.field.reason.label'
          }
        }
      ]
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'REINSTATE_REVOKE_REGISTRATION',
      label: {
        defaultMessage: 'Reinstate registration',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.reinstate-registration.label'
      },
      icon: 'ArchiveTray',
      supportingCopy: {
        defaultMessage:
          'This will restore a previously revoked registration to active status.',
        description:
          'This is the confirmation text for the reinstate revoke registration action',
        id: 'event.birth.action.revoke-registration.supportingCopy'
      },
      auditHistoryLabel: {
        defaultMessage: 'Registration reinstated',
        description:
          'The label to show in audit history for the reinstate registration action',
        id: 'event.birth.action.reinstate-registration.audit-history-label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: flag('revoked')
        }
      ],
      flags: [{ id: 'revoked', operation: 'remove' }],
      form: [
        {
          id: 'reason',
          type: 'TEXTAREA',
          required: true,
          label: {
            defaultMessage: 'Reason',
            description:
              'This is the label for the reason field for revoke registration action',
            id: 'event.birth.custom.action.revoke-registration.field.reason.label'
          }
        }
      ]
    },
    {
      type: ActionType.REJECT,
      label: {
        defaultMessage: 'Reject',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.reject.label'
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
        id: 'event.birth.action.register.label'
      },
      supportingCopy: {
        id: 'event.birth.action.register.supportingCopy',
        description: 'Confirmation text for the register action',
        defaultMessage:
          "Registering this birth event will create an official civil registration record. Please ensure all details are correct before proceeding.<br></br><br></br><strong>WARNING!</strong>: By clicking 'Register', you confirm that you have reviewed the record alongside supporting documentation in the Record tab. The record will proceed to be <strong>legally registered</strong> via the outbox. Further amends after registration can only be made via a legal correction process."
      },
      form: [
        {
          id: 'documents-verified',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Supporting documents reviewed?',
            description:
              'This is the label for the supporting documents verification field on the register action dialog',
            id: 'event.birth.action.register.field.documents-verified.label'
          },
          options: [
            {
              value: 'YES',
              label: {
                defaultMessage: 'Yes',
                description:
                  'Option label for supporting documents reviewed: yes',
                id: 'event.birth.action.register.field.documents-verified.option.yes.label'
              }
            },
            {
              value: 'NOT_APPLICABLE',
              label: {
                defaultMessage: 'Not applicable',
                description:
                  'Option label for supporting documents reviewed: not applicable',
                id: 'event.birth.action.register.field.documents-verified.option.not-applicable.label'
              }
            }
          ]
        },
        {
          id: 'book-number',
          type: 'TEXT',
          label: {
            defaultMessage: 'Register book number',
            description:
              'This is the label for the register book number field on the register action dialog',
            id: 'event.birth.action.register.field.book-number.label'
          }
        },
        {
          id: 'page-number',
          type: 'TEXT',
          label: {
            defaultMessage: 'Register page number',
            description:
              'This is the label for the register page number field on the register action dialog',
            id: 'event.birth.action.register.field.page-number.label'
          }
        },
        {
          id: 'comments',
          type: 'TEXTAREA',
          label: {
            defaultMessage: 'Additional comments',
            description:
              'This is the label for the additional comments field on the register action dialog',
            id: 'event.birth.action.register.field.comments.label'
          }
        }
      ],
      flags: [
        { id: 'validated', operation: 'remove' },
        { id: 'pending-first-certificate-issuance', operation: 'add' }
      ],
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: and(
            flag('validated'),
            not(flag('approval-required-for-late-registration')),
            not(flag('escalated-to-provincial-registrar')),
            not(flag('escalated-to-registrar-general'))
          )
        }
      ],
      deduplication: {
        id: 'birth-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.birth.action.detect-duplicate.label'
        },
        query: dedupConfig
      }
    },
    {
      type: ActionType.PRINT_CERTIFICATE,
      label: {
        defaultMessage: 'Print',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.collect-certificate.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            or(
              flag('revoked'),
              flag('certified-copy-printed-in-advance-of-issuance')
            )
          )
        }
      ],
      flags: [
        {
          id: 'certified-copy-printed-in-advance-of-issuance',
          operation: 'add',
          conditional: field('collector.requesterId').isEqualTo(
            'PRINT_IN_ADVANCE'
          )
        },
        { id: 'pending-first-certificate-issuance', operation: 'remove' }
      ],
      printForm: BIRTH_CERTIFICATE_COLLECTOR_FORM
    },
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        id: 'event.birth.action.request-correction.label',
        defaultMessage: 'Correct',
        description:
          'This is shown as the action name anywhere the user can trigger the action from'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: not(flag('revoked')) }
      ],
      correctionForm: CORRECTION_FORM
    },
    {
      type: ActionType.REJECT_CORRECTION,
      label: {
        id: 'v2.events.correction.reject.label',
        defaultMessage: 'Reject correction',
        description: 'Label for the reject correction action'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: not(flag('revoked')) }
      ]
    },
    {
      type: ActionType.APPROVE_CORRECTION,
      label: {
        defaultMessage: 'Approve correction',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.approve-correction.label'
      },
      flags: [{ id: 'corrected-record', operation: 'add' }]
    },
    {
      type: ActionType.MARK_AS_DUPLICATE,
      label: {
        defaultMessage: 'Review potential duplicates',
        description:
          'Label for review potential duplicate button in dropdown menu',
        id: 'event.birth.action.mark-as-duplicate.label'
      },
      flags: [{ id: 'validated', operation: 'remove' }]
    },
    {
      type: ActionType.ARCHIVE,
      label: {
        defaultMessage: 'Archive',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.archive.label'
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
        id: 'event.birth.action.unarchive.label'
      },
      supportingCopy: {
        id: 'recordAudit.unarchive.confirmation.body',
        defaultMessage:
          'This record will become active again and will be able to progress through registration.',
        description: 'Confirmation body for unarchiving a declaration'
      }
    },
    verifiableCredentialActions.issueBirthCredentialAction,
    {
      type: ActionType.CUSTOM,
      customActionType: 'SEAL',
      icon: 'Lock',
      label: {
        defaultMessage: 'Seal',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.custom.action.seal.label'
      },
      form: [
        {
          id: 'reason',
          type: FieldType.SELECT,
          required: true,
          label: {
            defaultMessage: 'Seal reason / legal basis',
            description: 'This is the label for the seal reason field',
            id: 'event.birth.custom.action.seal.field.reason.label'
          },
          options: [
            {
              value: 'ADOPTION',
              label: {
                defaultMessage: 'Adoption',
                description: 'Option label for adoption as the seal reason',
                id: 'event.birth.custom.action.seal.field.reason.option.adoption.label'
              }
            },
            {
              value: 'COURT_ORDER',
              label: {
                defaultMessage: 'Court order',
                description: 'Option label for court order as the seal reason',
                id: 'event.birth.custom.action.seal.field.reason.option.courtOrder.label'
              }
            },
            {
              value: 'OTHER',
              label: {
                defaultMessage: 'Other',
                description: 'Option label for other seal reasons',
                id: 'event.birth.custom.action.seal.field.reason.option.other.label'
              }
            }
          ]
        },
        {
          id: 'courtOrderReference',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'Court order reference',
            description:
              'This is the label for the court order reference field',
            id: 'event.birth.custom.action.seal.field.courtOrderReference.label'
          }
        },
        {
          id: 'requestingParty',
          type: FieldType.TEXT,
          required: false,
          label: {
            defaultMessage: 'Requesting party',
            description: 'This is the label for the requesting party field',
            id: 'event.birth.custom.action.seal.field.requestingParty.label'
          }
        },
        {
          id: 'courtOrderCopy',
          type: FieldType.FILE,
          required: true,
          uncorrectable: true,
          configuration: {
            maxFileSize: 5 * 1024 * 1024,
            acceptedFileTypes: [
              ImageMimeType.enum['image/jpeg'],
              ImageMimeType.enum['image/png'],
              ImageMimeType.enum['image/jpg'],
              DocumentMimeType.enum['application/pdf']
            ]
          },
          label: {
            defaultMessage: 'Supporting document — court order copy',
            description: 'This is the label for the supporting document field',
            id: 'event.birth.custom.action.seal.field.courtOrderCopy.label'
          }
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(status('REGISTERED'), not(flag('sealed')))
        }
      ],
      flags: [{ id: 'sealed', operation: 'add' }],
      auditHistoryLabel: {
        defaultMessage: 'Sealed',
        description: 'The label to show in audit history for the seal action',
        id: 'event.birth.custom.action.seal.audit-history-label'
      }
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'UNSEAL',
      icon: 'Unlock',
      label: {
        defaultMessage: 'Unseal',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.custom.action.unseal.label'
      },
      auditHistoryLabel: {
        defaultMessage: 'Unsealed',
        description: 'The label to show in audit history for the seal action',
        id: 'event.birth.custom.action.unseal.audit-history-label'
      },
      form: [
        {
          id: 'reason',
          type: FieldType.TEXTAREA,
          required: true,
          label: {
            defaultMessage: 'Reason',
            description: 'This is the label for reason field',
            id: 'form.field.label.reason'
          }
        },
        {
          id: 'comments',
          type: FieldType.TEXTAREA,
          required: true,
          label: {
            defaultMessage: 'Additional comments',
            description: 'This is the label for additional comments field',
            id: 'form.field.label.additionalComments'
          }
        }
      ],
      flags: [{ id: 'sealed', operation: 'remove' }],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: flag('sealed')
        }
      ]
    }
  ],
  advancedSearch: advancedSearchBirth
})
