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
import { defineConditional, defineConfig, defineForm, field } from '../events'

const TENNIS_CLUB_FORM = defineForm({
  label: {
    id: 'v2.event.tennis-club-membership.action.declare.form.label',
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this form is referred as in the system'
  },
  active: true,
  version: {
    id: '1.0.0',
    label: {
      id: 'v2.event.tennis-club-membership.action.declare.form.version.1',
      defaultMessage: 'Version 1',
      description: 'This is the first version of the form'
    }
  },
  review: {
    title: {
      id: 'v2.event.tennis-club-membership.action.declare.form.review.title',
      defaultMessage: 'Member declaration for {firstname} {surname}',
      description: 'Title of the form to show in review page'
    },
    fields: [
      {
        id: 'review.comment',
        type: 'TEXTAREA',
        label: {
          defaultMessage: 'Comment',
          id: 'v2.event.birth.action.declare.form.review.comment.label',
          description: 'Label for the comment field in the review section'
        }
      },
      {
        type: 'SIGNATURE',
        id: 'review.signature',
        required: false,
        signaturePromptLabel: {
          id: 'v2.signature.upload.modal.title',
          defaultMessage: 'Draw signature',
          description: 'Title for the modal to draw signature'
        },
        label: {
          defaultMessage: 'Signature of informant',
          id: 'v2.event.birth.action.declare.form.review.signature.label',
          description: 'Label for the signature field in the review section'
        }
      }
    ]
  },
  pages: [
    {
      id: 'applicant',
      title: {
        id: 'v2.event.tennis-club-membership.action.declare.form.section.who.title',
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
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.firstname.label'
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
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.surname.label'
          }
        },
        {
          id: 'applicant.dob',
          type: 'DATE',
          required: true,
          conditionals: [],
          validation: [
            {
              message: {
                defaultMessage: 'Please enter a valid date',
                description: 'This is the error message for invalid date',
                id: 'v2.event.birth.action.declare.form.section.child.field.dob.error'
              },
              validator: field('applicant.dob').isBefore().now()
            }
          ],
          label: {
            defaultMessage: "Applicant's date of birth",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.dob.label'
          }
        }
      ]
    },
    {
      id: 'recommender',
      title: {
        id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.title',
        defaultMessage: 'Who is recommending the applicant?',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'recommender.none',
          conditionals: [],
          required: false,
          label: {
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.none.label',
            defaultMessage: 'No recommender',
            description: 'This is the label for the field'
          },
          type: 'CHECKBOX'
        },
        {
          id: 'recommender.firstname',
          conditionals: [
            {
              type: 'SHOW',
              conditional: defineConditional({
                type: 'object',
                properties: {
                  $form: {
                    type: 'object',
                    properties: {
                      'recommender.none': {
                        anyOf: [
                          {
                            const: 'undefined'
                          },
                          {
                            const: false
                          },
                          {
                            const: null
                          },
                          {
                            const: ''
                          }
                        ]
                      }
                    },
                    anyOf: [
                      {
                        required: ['recommender.none']
                      },
                      {
                        not: {
                          required: ['recommender.none']
                        }
                      }
                    ]
                  }
                },
                required: ['$form']
              })
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.firstname.label',
            defaultMessage: "Recommender's first name",
            description: 'This is the label for the field'
          },
          type: 'TEXT'
        },
        {
          id: 'recommender.surname',
          conditionals: [
            {
              type: 'SHOW',
              conditional: defineConditional({
                type: 'object',
                properties: {
                  $form: {
                    type: 'object',
                    properties: {
                      'recommender.none': {
                        anyOf: [
                          {
                            const: 'undefined'
                          },
                          {
                            const: false
                          },
                          {
                            const: null
                          },
                          {
                            const: ''
                          }
                        ]
                      }
                    },
                    anyOf: [
                      {
                        required: ['recommender.none']
                      },
                      {
                        not: {
                          required: ['recommender.none']
                        }
                      }
                    ]
                  }
                },
                required: ['$form']
              })
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.surname.label',
            defaultMessage: "Recommender's surname",
            description: 'This is the label for the field'
          },
          type: 'TEXT'
        },
        {
          id: 'recommender.id',
          conditionals: [
            {
              type: 'SHOW',
              conditional: defineConditional({
                type: 'object',
                properties: {
                  $form: {
                    type: 'object',
                    properties: {
                      'recommender.none': {
                        anyOf: [
                          {
                            const: 'undefined'
                          },
                          {
                            const: false
                          },
                          {
                            const: null
                          },
                          {
                            const: ''
                          }
                        ]
                      }
                    },
                    anyOf: [
                      {
                        required: ['recommender.none']
                      },
                      {
                        not: {
                          required: ['recommender.none']
                        }
                      }
                    ]
                  }
                },
                required: ['$form']
              })
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.id.label',
            defaultMessage: "Recommender's membership ID",
            description: 'This is the label for the field'
          },
          type: 'TEXT'
        }
      ]
    }
  ]
})

export const tennisClubMembershipEvent = defineConfig({
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
        defaultMessage: 'Summary',
        description: 'This is the title of the summary',
        id: 'event.tennis-club-membership.summary.title'
      },
      emptyValueMessage: {
        defaultMessage: 'Membership application',
        description:
          'This is the message shown when the applicant name is missing',
        id: 'event.tennis-club-membership.summary.title.empty'
      }
    },
    fields: [
      {
        id: 'applicant.firstname',
        label: {
          defaultMessage: "Applicant's first name",
          description: 'This is the label for the field',
          id: 'event.tennis-club-membership.summary.field.firstname.label'
        },
        value: {
          defaultMessage: '{applicant.firstname}',
          description: 'This is the value to show in the summary',
          id: 'event.tennis-club-membership.summary.field.firstname'
        },
        emptyValueMessage: {
          defaultMessage: 'First name is not provided',
          description: 'This is the message to show when the field is empty',
          id: 'event.tennis-club-membership.summary.field.firstname.empty'
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
      forms: [TENNIS_CLUB_FORM]
    },
    {
      type: 'REGISTER',
      label: {
        defaultMessage: 'Send an application',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.declare.label'
      },
      forms: [TENNIS_CLUB_FORM]
    },
    {
      type: 'VALIDATE',
      label: {
        defaultMessage: 'Validate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.validate.label'
      },
      forms: []
    },
    {
      type: 'REQUEST_CORRECTION',
      label: {
        defaultMessage: 'Request correction',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.correction.request.label'
      },

      forms: [TENNIS_CLUB_FORM],
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
              label: {
                id: 'v2.correction.corrector.title',
                defaultMessage: 'Who is requesting a change to this record?',
                description: 'The title for the corrector form'
              },
              defaultValue: '',
              options: [
                {
                  value: 'INFORMANT',
                  label: {
                    id: 'v2.correction.corrector.informant',
                    defaultMessage: 'Informant',
                    description:
                      'Label for informant option in certificate correction form'
                  }
                },
                {
                  value: 'ANOTHER_AGENT',
                  label: {
                    id: 'v2.correction.corrector.anotherAgent',
                    defaultMessage: 'Another registration agent or field agent',
                    description:
                      'Label for another registration or field agent option in certificate correction form'
                  }
                },
                {
                  value: 'REGISTRAR',
                  label: {
                    id: 'v2.correction.corrector.me',
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
              label: {
                id: 'correction.corrector.identity.verified.label',
                defaultMessage: 'Identity verified',
                description: 'The title for the corrector form'
              },
              defaultValue: '',
              required: true,
              options: [
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
      ]
    },
    {
      type: 'APPROVE_CORRECTION',
      forms: [TENNIS_CLUB_FORM],
      label: {
        defaultMessage: 'Approve correction',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.correction.approve.label'
      }
    },
    {
      type: 'PRINT_CERTIFICATE',
      label: {
        defaultMessage: 'Print certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.collect-certificate.label'
      },
      forms: [TENNIS_CLUB_FORM]
    }
  ],
  advancedSearch: [
    {
      id: 'RANDOM',
      title: {
        defaultMessage: 'Tennis club registration search',
        description: 'This is what this event is referred as in the system',
        id: 'v2.event.tennis-club-membership.search'
      },
      fields: [
        {
          fieldId: 'applicant.dob'
        }
      ]
    }
  ]
})
