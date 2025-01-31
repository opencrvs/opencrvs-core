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
import { v4 as uuid } from 'uuid'
import { EventDocument } from '@opencrvs/commons'
import { EventConfig, EventIndex, FormConfig } from '@opencrvs/commons/client'

const DEFAULT_FORM = {
  label: {
    id: 'event.tennis-club-membership.action.declare.form.label',
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this form is referred as in the system'
  },
  active: true,
  version: {
    id: '1.0.0',
    label: {
      id: 'event.tennis-club-membership.action.declare.form.version.1',
      defaultMessage: 'Version 1',
      description: 'This is the first version of the form'
    }
  },
  review: {
    title: {
      id: 'event.tennis-club-membership.action.declare.form.review.title',
      defaultMessage: 'Member declaration for {firstname} {surname}',
      description: 'Title of the form to show in review page'
    }
  },
  pages: [
    {
      id: 'applicant',
      title: {
        id: 'event.tennis-club-membership.action.declare.form.section.who.title',
        defaultMessage: 'Who is applying for the membership?',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'applicant.firstname',
          type: 'TEXT',
          required: true,
          conditionals: [],
          label: {
            defaultMessage: "Applicant's first name",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.firstname.label'
          }
        },
        {
          id: 'applicant.surname',
          type: 'TEXT',
          required: true,
          conditionals: [],
          label: {
            defaultMessage: "Applicant's surname",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.surname.label'
          }
        },
        {
          id: 'applicant.dob',
          type: 'DATE',
          required: true,
          conditionals: [],
          label: {
            defaultMessage: "Applicant's date of birth",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.dob.label'
          }
        }
      ]
    },
    {
      id: 'recommender',
      title: {
        id: 'event.tennis-club-membership.action.declare.form.section.recommender.title',
        defaultMessage: 'Who is recommending the applicant?',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'recommender.none',
          conditionals: [],
          required: false,
          label: {
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.none.label',
            defaultMessage: 'No recommender',
            description: 'This is the label for the field'
          },
          type: 'CHECKBOX'
        },
        {
          id: 'recommender.firstname',
          conditionals: [
            {
              type: 'HIDE',
              conditional: {
                type: 'object',
                properties: {
                  $form: {
                    type: 'object',
                    properties: {
                      'recommender.none': {
                        const: 'true'
                      }
                    },
                    required: ['recommender.none']
                  }
                },
                required: ['$form']
              }
            }
          ],
          required: true,
          label: {
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.firstname.label',
            defaultMessage: "Recommender's first name",
            description: 'This is the label for the field'
          },
          type: 'TEXT'
        },
        {
          id: 'recommender.surname',
          conditionals: [
            {
              type: 'HIDE',
              conditional: {
                type: 'object',
                properties: {
                  $form: {
                    type: 'object',
                    properties: {
                      'recommender.none': {
                        const: 'true'
                      }
                    },
                    required: ['recommender.none']
                  }
                },
                required: ['$form']
              }
            }
          ],
          required: true,
          label: {
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.surname.label',
            defaultMessage: "Recommender's surname",
            description: 'This is the label for the field'
          },
          type: 'TEXT'
        },
        {
          id: 'recommender.id',
          conditionals: [
            {
              type: 'HIDE',
              conditional: {
                type: 'object',
                properties: {
                  $form: {
                    type: 'object',
                    properties: {
                      'recommender.none': {
                        const: 'true'
                      }
                    },
                    required: ['recommender.none']
                  }
                },
                required: ['$form']
              }
            }
          ],
          required: true,
          label: {
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.id.label',
            defaultMessage: "Recommender's membership ID",
            description: 'This is the label for the field'
          },
          type: 'TEXT'
        }
      ]
    }
  ]
} satisfies FormConfig

/** @knipignore */
export const tennisClubMembershipEvent = {
  id: 'TENNIS_CLUB_MEMBERSHIP',
  label: {
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this event is referred as in the system',
    id: 'event.tennis-club-membership.label'
  },
  summary: {
    title: {
      id: 'event.tennis-club-membership.summary.title',
      label: {
        defaultMessage: '{applicant.firstname} {applicant.surname}',
        description: 'This is the title of the summary',
        id: 'event.tennis-club-membership.summary.title.label'
      }
    },
    fields: [
      {
        id: 'applicant.firstname',
        value: {
          defaultMessage: '{applicant.firstname}',
          description: 'Value for the matching field on form.',
          id: 'event.tennis-club-membership.summary.field.firstname.value'
        },
        label: {
          defaultMessage: 'First name',
          description: 'Label for the given field on form.',
          id: 'event.tennis-club-membership.summary.field.firstname.label'
        }
      }
    ]
  },
  workqueues: [
    {
      id: 'all',
      fields: [
        {
          column: 'title',
          label: {
            defaultMessage: '{applicant.firstname} {applicant.surname}',
            description: 'Label for name in all workqueue',
            id: 'event.tennis-club-membership.workqueue.all.name.label'
          }
        }
      ],
      filters: []
    },
    {
      id: 'ready-for-review',

      fields: [
        {
          column: 'title',
          label: {
            defaultMessage: '{applicant.firstname} {applicant.surname}',
            description: 'Label for name in all workqueue',
            id: 'event.tennis-club-membership.workqueue.readyForReview.name.label'
          }
        }
      ],
      filters: [
        {
          status: ['DECLARED']
        }
      ]
    },
    {
      id: 'registered',

      fields: [
        {
          column: 'title',
          label: {
            defaultMessage: '{applicant.firstname} {applicant.surname}',
            description: 'Label for name in all workqueue',
            id: 'event.tennis-club-membership.workqueue.registered.name.label'
          }
        }
      ],
      filters: [
        {
          status: ['REGISTERED']
        }
      ]
    }
  ],
  actions: [
    {
      type: 'DECLARE',
      label: {
        defaultMessage: 'Send an application',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.declare.label'
      },
      forms: [DEFAULT_FORM]
    },
    {
      type: 'REQUEST_CORRECTION',
      label: {
        defaultMessage:
          'Request a correction for {applicant.firstname} {applicant.surname}',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.requestCorrection.label'
      },
      onboardingForm: [
        {
          id: 'correction-requester',
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
              options: {},
              label: {
                id: 'correction.corrector.title',
                defaultMessage: 'Who is requesting a change to this record?',
                description: 'The title for the corrector form'
              },
              initialValue: '',
              optionValues: [
                {
                  value: 'INFORMANT',
                  label: {
                    id: 'correction.corrector.informant',
                    defaultMessage: 'Informant',
                    description:
                      'Label for informant option in certificate correction form'
                  }
                },
                {
                  value: 'ANOTHER_AGENT',
                  label: {
                    id: 'correction.corrector.anotherAgent',
                    defaultMessage: 'Another registration agent or field agent',
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
                    id: 'correction.corrector.others',
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
          title: {
            id: 'event.tennis-club-membership.action.requestCorrection.form.section.verify',
            defaultMessage: 'Verify their identity',
            description: 'This is the title of the section'
          },
          fields: [
            {
              id: 'correction.identity-check.instructions',
              type: 'PAGE_HEADER',
              label: {
                id: 'correction.corrector.identity.instruction',
                defaultMessage:
                  'Please verify the identity of the person making this request',
                description: 'The title for the corrector form'
              }
            },
            {
              id: 'correction.identity-check.verified',
              type: 'RADIO_GROUP',
              options: {},
              label: {
                id: 'correction.corrector.identity.verified.label',
                defaultMessage: '@todo',
                description: 'The title for the corrector form'
              },
              initialValue: '',
              required: true,
              optionValues: [
                {
                  value: 'VERIFIED',
                  label: {
                    id: 'correction.corrector.identity.verified',
                    defaultMessage: 'I have verified their identity',
                    description:
                      'Label for verified option in corrector identity check page'
                  }
                }
              ]
            }
          ]
        }
      ],
      additionalDetailsForm: [
        {
          id: 'correction-request.supporting-documents',
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
              type: 'FILE',
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
              initialValue: '',
              options: {
                size: 'NORMAL'
              },
              optionValues: [
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
          title: {
            id: 'event.tennis-club-membership.action.requestCorrection.form.section.corrector',
            defaultMessage: 'Reason for correction',
            description: 'This is the title of the section'
          },
          fields: [
            {
              id: 'correction.request.reason',
              type: 'TEXT',
              label: {
                id: 'correction.reason.title',
                defaultMessage: 'Reason for correction?',
                description: 'The title for the corrector form'
              }
            }
          ]
        }
      ],
      forms: [DEFAULT_FORM]
    }
  ],
  deduplication: [
    {
      id: 'STANDARD CHECK',
      label: {
        defaultMessage: 'Standard check',
        description:
          'This could be shown to the user in a reason for duplicate detected',
        id: '...'
      },
      query: {
        type: 'and',
        clauses: [
          {
            fieldId: 'applicant.firstname',
            type: 'strict',
            options: {
              boost: 1
            }
          }
        ]
      }
    }
  ],
  advancedSearch: []
} satisfies EventConfig

export const tennisClubMembershipEventIndex: EventIndex = {
  id: uuid(),
  type: 'TENNIS_CLUB_MEMBERSHIP',
  status: 'CREATED',
  createdAt: '2023-03-01T00:00:00.000Z',
  createdBy: uuid(),
  createdAtLocation: uuid(),
  modifiedAt: '2023-03-01T00:00:00.000Z',
  assignedTo: null,
  updatedBy: 'system',
  data: {
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'applicant.dob': '1990-01-01'
  }
}

export const tennisClueMembershipEventDocument: EventDocument = {
  type: 'TENNIS_CLUB_MEMBERSHIP',
  id: 'c5d9d901-00bf-4631-89dc-89ca5060cb52',
  createdAt: '2025-01-23T05:30:02.615Z',
  updatedAt: '2025-01-23T05:35:27.689Z',
  actions: [
    {
      id: 'ae9618d8-319d-48a7-adfe-7ad6cfbc56b7',
      type: 'CREATE',
      createdAt: '2025-01-23T05:30:02.615Z',
      createdBy: '6780dbf7a263c6515c7b97d2',
      createdAtLocation: '052891bf-916a-4332-a76a-dae0ebb0efbf',
      draft: false,
      data: {}
    },
    {
      id: '8db635cf-ee30-40ca-8117-a7188256a2b1',
      draft: false,
      data: {
        'applicant.firstname': 'Riku'
      },
      type: 'DECLARE',
      createdBy: '6780dbf7a263c6515c7b97d2',
      createdAt: '2025-01-23T05:30:08.847Z',
      createdAtLocation: '052891bf-916a-4332-a76a-dae0ebb0efbf'
    },
    {
      id: '9e048856-8c4d-4f85-8b7f-5f13885d2374',
      draft: false,
      data: {
        'applicant.firstname': 'Riku'
      },
      type: 'REGISTER',
      identifiers: {
        trackingId: '95af4c4a-7fe2-4bb5-9a46-1a935b9497b8',
        registrationNumber: '7b3a477a-4f3e-459a-9469-8956cf9dd8e5'
      },
      createdBy: '6780dbf7a263c6515c7b97d2',
      createdAt: '2025-01-23T05:35:27.689Z',
      createdAtLocation: '052891bf-916a-4332-a76a-dae0ebb0efbf'
    }
  ]
}
