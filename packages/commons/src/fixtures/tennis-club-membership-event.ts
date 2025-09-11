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
import { defineConditional } from '../conditionals/conditionals'
import { defineConfig } from '../events/defineConfig'
import { ActionType, DeclarationActionType } from '../events/ActionType'
import { PageTypes } from '../events/PageConfig'
import { FieldType } from '../events/FieldType'
import { field } from '../events/field'
import { event } from '../events/event'
import { TENNIS_CLUB_MEMBERSHIP } from '../events/Constants'
import {
  PRINT_CERTIFICATE_FORM,
  TENNIS_CLUB_DECLARATION_FORM,
  TENNIS_CLUB_DECLARATION_REVIEW
} from './forms'
import { Clause, EventConfig } from '../events'
import { and, field as dedupField } from '../events/deduplication'

export const tennisClubMembershipEvent = defineConfig({
  id: TENNIS_CLUB_MEMBERSHIP,
  label: {
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this event is referred as in the system',
    id: 'v2.event.tennis-club-membership.label'
  },
  title: {
    defaultMessage: '{applicant.name.firstname} {applicant.name.surname}',
    description: 'This is the title of the summary',
    id: 'v2.event.tennis-club-membership.title'
  },
  summary: {
    fields: [
      {
        fieldId: 'applicant.name',
        label: {
          defaultMessage: "Applicant's name",
          description: 'This is the label for the field',
          id: 'event.tennis-club-membership.summary.field.firstname.label'
        },
        emptyValueMessage: {
          defaultMessage: 'First name is not provided',
          description: 'This is the message to show when the field is empty',
          id: 'event.tennis-club-membership.summary.field.firstname.empty'
        }
      },
      {
        fieldId: 'applicant.email'
      }
    ]
  },
  actions: [
    {
      type: ActionType.READ,
      label: {
        id: 'v2.event.tennis-club-membership.action.read.label',
        defaultMessage: 'Read',
        description: 'Title of the read only page'
      },
      review: TENNIS_CLUB_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Send an application',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.declare.label'
      },
      review: TENNIS_CLUB_DECLARATION_REVIEW
    },
    {
      type: ActionType.VALIDATE,
      label: {
        defaultMessage: 'Validate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.validate.label'
      },
      review: TENNIS_CLUB_DECLARATION_REVIEW
    },
    {
      type: ActionType.REGISTER,
      label: {
        defaultMessage: 'Register',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.register.label'
      },
      review: TENNIS_CLUB_DECLARATION_REVIEW
    },
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        defaultMessage: 'Request correction',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.correction.request.label'
      },
      correctionForm: {
        label: {
          id: 'v2.event.tennis-club-membership.action.request-correction.label',
          defaultMessage: 'Request correction',
          description:
            'This is shown as the action name anywhere the user can trigger the action from'
        },
        pages: [
          {
            id: 'correction-requester',
            type: PageTypes.enum.FORM,
            title: {
              id: 'event.tennis-club-membership.action.requestCorrection.form.section.corrector',
              defaultMessage: 'Correction requester',
              description: 'This is the title of the section'
            },
            fields: [
              {
                id: 'correction.requester.relationshop.intro',
                type: 'PAGE_HEADER',
                label: {
                  id: 'correction.requester.relationshop.intro.label',
                  defaultMessage:
                    'Note: In the case that the child is now of legal age (18) then only they should be able to request a change to their birth record.',
                  description: 'The title for the corrector form'
                }
              },
              {
                id: 'correction.requester.relationship',
                type: 'RADIO_GROUP',
                label: {
                  id: 'correction.corrector.title',
                  defaultMessage: 'Who is requesting a change to this record?',
                  description: 'The title for the corrector form'
                },
                defaultValue: '',
                options: [
                  {
                    value: 'INFORMANT',
                    label: {
                      id: 'informant.name',
                      defaultMessage: 'Informant',
                      description:
                        'Label for informant option in certificate correction form'
                    }
                  },
                  {
                    value: 'ANOTHER_AGENT',
                    label: {
                      id: 'v2.correction.corrector.anotherAgent',
                      defaultMessage:
                        'Another registration agent or field agent',
                      description:
                        'Label for another registration or field agent option in certificate correction form'
                    }
                  },
                  {
                    value: 'REGISTRAR',
                    label: {
                      id: 'correction.corrector.me',
                      defaultMessage: 'Me (Registrar)',
                      description:
                        'Label for registrar option in certificate correction form'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      id: 'v2.correction.corrector.others',
                      defaultMessage: 'Someone else',
                      description:
                        'Label for someone else option in certificate correction form'
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 'identity-check',
            type: PageTypes.enum.VERIFICATION,
            title: {
              id: 'v2.event.birth.action.correction.form.section.requester.identity.verify.title',
              defaultMessage: 'Verify ID',
              description: 'This is the title of the section'
            },
            fields: [],
            actions: {
              verify: {
                label: {
                  defaultMessage: 'Verified',
                  description: 'This is the label for the verification button',
                  id: 'v2.event.birth.action.correction.form.verify'
                }
              },
              cancel: {
                label: {
                  defaultMessage: 'Identity does not match',
                  description:
                    'This is the label for the verification cancellation button',
                  id: 'v2.event.birth.action.correction.form.cancel'
                },
                confirmation: {
                  title: {
                    defaultMessage: 'Correct without proof of ID?',
                    description:
                      'This is the title for the verification cancellation modal',
                    id: 'v2.event.birth.action.correction.form.cancel.confirmation.title'
                  },
                  body: {
                    defaultMessage:
                      'Please be aware that if you proceed, you will be responsible for making a change to this record without the necessary proof of identification',
                    description:
                      'This is the body for the verification cancellation modal',
                    id: 'v2.event.birth.action.correction.form.cancel.confirmation.body'
                  }
                }
              }
            }
          },
          {
            id: 'correction-request.supporting-documents',
            type: PageTypes.enum.FORM,
            title: {
              id: 'event.tennis-club-membership.action.requestCorrection.form.section.verify',
              defaultMessage: 'Upload supporting documents',
              description: 'This is the title of the section'
            },
            fields: [
              {
                id: 'correction.supportingDocs.introduction',
                type: 'PAGE_HEADER',
                label: {
                  id: 'correction.corrector.paragraph.title',
                  defaultMessage:
                    'For all record corrections at a minimum an affidavit must be provided. For material errors and omissions eg. in paternity cases, a court order must also be provided.',
                  description: 'The title for the corrector form'
                }
              },
              {
                id: 'correction.supportingDocs',
                type: FieldType.FILE,
                label: {
                  id: 'correction.corrector.title',
                  defaultMessage: 'Upload supporting documents',
                  description: 'The title for the corrector form'
                }
              },
              {
                id: 'correction.request.supportingDocuments',
                type: 'RADIO_GROUP',
                label: {
                  id: 'correction.corrector.title',
                  defaultMessage: 'Who is requesting a change to this record?',
                  description: 'The title for the corrector form'
                },
                defaultValue: '',
                configuration: {
                  styles: {
                    size: 'NORMAL'
                  }
                },
                options: [
                  {
                    value: 'ATTEST',
                    label: {
                      id: 'correction.supportingDocuments.attest.label',
                      defaultMessage:
                        'I attest to seeing supporting documentation and have a copy filed at my office',
                      description: ''
                    }
                  },
                  {
                    value: 'NOT_NEEDED',
                    label: {
                      id: 'correction.supportingDocuments.notNeeded.label',
                      defaultMessage: 'No supporting documents required',
                      description: ''
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 'correction-request.additional-details',
            type: PageTypes.enum.FORM,
            title: {
              id: 'event.tennis-club-membership.action.requestCorrection.form.section.corrector',
              defaultMessage: 'Reason for correction',
              description: 'This is the title of the section'
            },
            fields: [
              {
                id: 'correction.request.reason',
                type: FieldType.TEXT,
                label: {
                  id: 'correction.reason.title',
                  defaultMessage: 'Reason for correction?',
                  description: 'The title for the corrector form'
                }
              }
            ]
          }
        ]
      }
    },
    {
      type: ActionType.APPROVE_CORRECTION,
      label: {
        defaultMessage: 'Approve correction',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.correction.approve.label'
      }
    },
    {
      type: ActionType.PRINT_CERTIFICATE,
      label: {
        id: 'v2.event.tennis-club-membership.action.collect-certificate.label',
        defaultMessage: 'Print certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from'
      },
      printForm: PRINT_CERTIFICATE_FORM,
      conditionals: [
        {
          type: 'SHOW',
          conditional: defineConditional({
            type: 'object',
            properties: {
              $event: {
                type: 'object',
                properties: {
                  actions: {
                    type: 'array',
                    contains: {
                      type: 'object',
                      properties: {
                        type: {
                          const: 'REGISTER'
                        },
                        draft: {
                          type: 'boolean'
                        }
                      },
                      required: ['type'],
                      not: {
                        properties: {
                          draft: {
                            const: true
                          }
                        }
                      }
                    }
                  }
                },
                required: ['actions']
              }
            },
            required: ['$event']
          })
        }
      ]
    },
    {
      type: ActionType.ARCHIVE,
      label: {
        id: 'v2.event.tennis-club-membership.action.archive.label',
        defaultMessage: 'Archive',
        description:
          'This is shown as the action name anywhere the user can trigger the action from'
      }
    },
    {
      type: ActionType.REJECT,
      label: {
        id: 'v2.event.tennis-club-membership.action.reject.label',
        defaultMessage: 'Reject',
        description:
          'This is shown as the action name anywhere the user can trigger the action from'
      }
    }
  ],
  advancedSearch: [
    {
      title: {
        defaultMessage: 'Registration details',
        description: 'The title of Registration details accordion',
        id: 'v2.advancedSearch.form.registrationDetails'
      },
      fields: [
        event('legalStatuses.REGISTERED.createdAtLocation').exact(),
        event('legalStatuses.REGISTERED.acceptedAt').range(),
        event('status').exact(),
        event('updatedAt').range()
      ]
    },
    {
      title: {
        defaultMessage: "Applicant's details",
        description: 'Applicant details search field section title',
        id: 'v2.event.tennis-club-membership.search.applicants'
      },
      fields: [
        field('applicant.name').fuzzy(),
        field('applicant.dob').range(),
        field('applicant.email').exact()
      ]
    },
    {
      title: {
        defaultMessage: "Recommender's details",
        description: 'Recommender details search field section title',
        id: 'v2.event.tennis-club-membership.search.recommender'
      },
      fields: [field('recommender.name').fuzzy()]
    }
  ],
  declaration: TENNIS_CLUB_DECLARATION_FORM
})

/** @knipignore */
export function tennisClubMembershipEventWithDedupCheck(
  ...actionsToCheck: DeclarationActionType[]
): EventConfig {
  return {
    ...tennisClubMembershipEvent,
    actions: tennisClubMembershipEvent.actions.map((action) => {
      if (!actionsToCheck.includes(action.type as DeclarationActionType)) {
        return action
      }
      return {
        ...action,
        deduplication: {
          id: 'tennis-club-membership-deduplication',
          label: {
            defaultMessage: 'Tennis club membership deduplication',
            description:
              'This is shown as the label for the deduplication configuration',
            id: 'event.tennis-club-membership.deduplication.label'
          },
          query: Clause.parse(
            and(
              dedupField('applicant.name').fuzzyMatches(),
              dedupField('applicant.email').strictMatches(),
              dedupField('applicant.dob').dateRangeMatches({
                days: 3 * 365
              })
            )
          )
        }
      }
    })
  }
}
