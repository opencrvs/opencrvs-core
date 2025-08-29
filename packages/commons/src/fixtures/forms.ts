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
import { defineConditional, never, not } from '../conditionals/conditionals'
import {
  defineActionForm,
  defineDeclarationForm
} from '../events/EventConfigInput'
import { ConditionalType } from '../events/Conditional'
import { PageTypes } from '../events/PageConfig'
import { FieldType } from '../events/FieldType'
import { field } from '../events/field'
import { format, subDays, subMonths, subQuarters, subYears } from 'date-fns'
import { EventStatus } from '../events/EventMetadata'

/** @knipignore */
export const PRINT_CERTIFICATE_FORM = defineActionForm({
  label: {
    id: 'v2.event.tennis-club-membership.action.certificate.form.label',
    defaultMessage: 'Tennis club membership certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'collector',
      type: PageTypes.enum.FORM,
      title: {
        id: 'v2.event.tennis-club-membership.action.certificate.form.section.who.title',
        defaultMessage: 'Print certified copy',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.requesterId',
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.label',
            defaultMessage: 'Requester',
            description: 'This is the label for the field'
          },
          type: FieldType.SELECT,
          options: [
            {
              value: 'INFORMANT',
              label: {
                id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.informant.label',
                defaultMessage: 'Print and issue Informant',
                description: 'This is the label for the field'
              }
            },
            {
              value: 'OTHER',
              label: {
                id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.other.label',
                defaultMessage: 'Print and issue someone else',
                description: 'This is the label for the field'
              }
            },
            {
              value: 'PRINT_IN_ADVANCE',
              label: {
                id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.printInAdvance.label',
                defaultMessage: 'Print in advance',
                description: 'This is the label for the field'
              }
            }
          ]
        },
        {
          id: 'collector.OTHER.idType',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.requesterId']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.requesterId': {
                              not: {
                                enum: ['OTHER']
                              }
                            }
                          },
                          required: ['collector.requesterId']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.idType.label',
            defaultMessage: 'Select Type of ID',
            description: 'This is the label for selecting the type of ID'
          },
          type: FieldType.SELECT,
          options: [
            {
              value: 'PASSPORT',
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.passport.label',
                defaultMessage: 'Passport',
                description: 'Option for selecting Passport as the ID type'
              }
            },
            {
              value: 'DRIVING_LICENSE',
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.drivingLicense.label',
                defaultMessage: 'Driving License',
                description:
                  'Option for selecting Driving License as the ID type'
              }
            },
            {
              value: 'REFUGEE_NUMBER',
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.refugeeNumber.label',
                defaultMessage: 'Refugee Number',
                description:
                  'Option for selecting Refugee Number as the ID type'
              }
            },
            {
              value: 'ALIEN_NUMBER',
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.alienNumber.label',
                defaultMessage: 'Alien Number',
                description: 'Option for selecting Alien Number as the ID type'
              }
            },
            {
              value: 'OTHER',
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.other.label',
                defaultMessage: 'Other',
                description: 'Option for selecting Other as the ID type'
              }
            },
            {
              value: 'NO_ID',
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.noId.label',
                defaultMessage: 'No ID',
                description: 'Option for selecting No ID as the ID type'
              }
            }
          ]
        },
        {
          id: 'collector.PASSPORT.details',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.OTHER.idType']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.OTHER.idType': {
                              not: {
                                enum: ['PASSPORT']
                              }
                            }
                          },
                          required: ['collector.OTHER.idType']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.passportDetails.label',
            defaultMessage: 'Passport Details',
            description: 'Field for entering Passport details'
          },
          type: FieldType.TEXT
        },
        {
          id: 'collector.DRIVING_LICENSE.details',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.OTHER.idType']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.OTHER.idType': {
                              not: {
                                enum: ['DRIVING_LICENSE']
                              }
                            }
                          },
                          required: ['collector.OTHER.idType']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.drivingLicenseDetails.label',
            defaultMessage: 'Driving License Details',
            description: 'Field for entering Driving License details'
          },
          type: FieldType.TEXT
        },
        {
          id: 'collector.REFUGEE_NUMBER.details',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.OTHER.idType']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.OTHER.idType': {
                              not: {
                                enum: ['REFUGEE_NUMBER']
                              }
                            }
                          },
                          required: ['collector.OTHER.idType']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.refugeeNumberDetails.label',
            defaultMessage: 'Refugee Number Details',
            description: 'Field for entering Refugee Number details'
          },
          type: FieldType.TEXT
        },
        {
          id: 'collector.ALIEN_NUMBER.details',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.OTHER.idType']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.OTHER.idType': {
                              not: {
                                enum: ['ALIEN_NUMBER']
                              }
                            }
                          },
                          required: ['collector.OTHER.idType']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.alienNumberDetails.label',
            defaultMessage: 'Alien Number Details',
            description: 'Field for entering Alien Number details'
          },
          type: FieldType.TEXT
        },
        {
          id: 'collector.OTHER.idTypeOther',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.OTHER.idType']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.OTHER.idType': {
                              not: {
                                enum: ['OTHER']
                              }
                            }
                          },
                          required: ['collector.OTHER.idType']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.idTypeOther.label',
            defaultMessage: 'Other ID Type (if applicable)',
            description: 'Field for entering ID type if "Other" is selected'
          },
          type: FieldType.TEXT
        },
        {
          id: 'collector.OTHER.firstName',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.requesterId']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.requesterId': {
                              not: {
                                enum: ['OTHER']
                              }
                            }
                          },
                          required: ['collector.requesterId']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.firstName.label',
            defaultMessage: 'First Name',
            description: 'This is the label for the first name field'
          },
          type: FieldType.TEXT
        },
        {
          id: 'collector.OTHER.lastName',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.requesterId']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.requesterId': {
                              not: {
                                enum: ['OTHER']
                              }
                            }
                          },
                          required: ['collector.requesterId']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.lastName.label',
            defaultMessage: 'Last Name',
            description: 'This is the label for the last name field'
          },
          type: FieldType.TEXT
        },
        {
          id: 'collector.OTHER.relationshipToMember',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.requesterId']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.requesterId': {
                              not: {
                                enum: ['OTHER']
                              }
                            }
                          },
                          required: ['collector.requesterId']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.relationshipToMember.label',
            defaultMessage: 'Relationship to Member',
            description:
              'This is the label for the relationship to member field'
          },
          type: FieldType.TEXT
        },
        {
          id: 'collector.OTHER.signedAffidavit',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.requesterId']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.requesterId': {
                              not: {
                                enum: ['OTHER']
                              }
                            }
                          },
                          required: ['collector.requesterId']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: false,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.signedAffidavit.label',
            defaultMessage: 'Signed Affidavit (Optional)',
            description: 'This is the label for uploading a signed affidavit'
          },
          type: FieldType.FILE
        }
      ]
    },
    {
      id: 'collector.identity.verify',
      type: PageTypes.enum.VERIFICATION,
      conditional: field('collector.requesterId').isEqualTo('INFORMANT'),
      title: {
        id: 'event.tennis-club-membership.action.print.verifyIdentity',
        defaultMessage: 'Verify their identity',
        description: 'This is the title of the section'
      },
      fields: [],
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'v2.event.tennis-club-membership.action.certificate.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'v2.event.tennis-club-membership.action.certificate.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Print without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'v2.event.tennis-club-membership.action.certificate.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector',
              description:
                'This is the body for the verification cancellation modal',
              id: 'v2.event.tennis-club-membership.action.certificate.form.cancel.confirmation.body'
            }
          }
        }
      }
    }
  ]
})

export const TENNIS_CLUB_DECLARATION_REVIEW = {
  title: {
    id: 'v2.event.tennis-club-membership.action.declare.form.review.title',
    defaultMessage:
      '{applicant.name.firstname, select, __EMPTY__ {Member declaration} other {{applicant.name.surname, select, __EMPTY__ {Member declaration for {applicant.name.firstname}} other {Member declaration for {applicant.name.firstname} {applicant.name.surname}}}}}',
    description: 'Title of the review page'
  },
  fields: [
    {
      id: 'review.comment',
      type: FieldType.TEXTAREA,
      label: {
        defaultMessage: 'Comment',
        id: 'v2.event.birth.action.declare.form.review.comment.label',
        description: 'Label for the comment field in the review section'
      }
    },
    {
      type: FieldType.SIGNATURE,
      id: 'review.signature',
      label: {
        defaultMessage: 'Signature of informant',
        id: 'v2.event.birth.action.declare.form.review.signature.label',
        description: 'Label for the signature field in the review section'
      },
      signaturePromptLabel: {
        id: 'v2.signature.upload.modal.title',
        defaultMessage: 'Draw signature',
        description: 'Title for the modal to draw signature'
      }
    }
  ]
}

/** @knipignore */
export const TENNIS_CLUB_DECLARATION_FORM = defineDeclarationForm({
  label: {
    id: 'v2.event.tennis-club-membership.action.declare.form.label',
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this form is referred as in the system'
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
          id: 'applicant.name',
          type: FieldType.NAME,
          required: true,
          hideLabel: true,
          conditionals: [],
          label: {
            defaultMessage: "Applicant's name",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.firstname.label'
          },
          configuration: {
            name: {
              firstname: { required: true },
              middlename: { required: false },
              surname: { required: true }
            }
          },
          validation: [
            {
              validator: field('applicant.name').object({
                firstname: field('firstname').isValidEnglishName(),
                surname: field('surname').isValidEnglishName()
              }),
              message: {
                defaultMessage:
                  "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-), apostrophes(') and underscores (_)",
                description: 'This is the error message for invalid name',
                id: 'v2.error.invalidName'
              }
            }
          ]
        },
        {
          id: 'applicant.email',
          type: 'EMAIL',
          required: false,
          uncorrectable: true,
          conditionals: [],
          label: {
            defaultMessage: "Applicant's email",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.email.label'
          }
        },
        {
          id: 'applicant.dob',
          type: FieldType.DATE,
          required: true,
          validation: [
            {
              message: {
                defaultMessage: 'Please enter a valid date',
                description: 'This is the error message for invalid date',
                id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.dob.error'
              },
              validator: field('applicant.dob').isBefore().now()
            }
          ],
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('applicant.dobUnknown').isFalsy()
            }
          ],
          label: {
            defaultMessage: "Applicant's date of birth",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.dob.label'
          }
        },
        {
          id: 'applicant.dobUnknown',
          type: FieldType.CHECKBOX,
          required: false,
          label: {
            defaultMessage: 'Exact date of birth unknown',
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.dobUnknown.label'
          },
          conditionals: [
            {
              type: ConditionalType.DISPLAY_ON_REVIEW,
              conditional: never()
            }
          ]
        },
        {
          id: 'applicant.age',
          type: FieldType.NUMBER,
          required: true,
          label: {
            defaultMessage: 'Age of tennis-member',
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.age.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('applicant.dobUnknown').isEqualTo(true)
            }
          ]
        },
        {
          id: 'applicant.image',
          type: FieldType.FILE,
          required: false,
          uncorrectable: true,
          label: {
            defaultMessage: "Applicant's profile picture",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.image.label'
          }
        },
        {
          id: 'applicant.address',
          type: 'ADDRESS',
          required: true,
          secured: true,
          conditionals: [],
          label: {
            defaultMessage: "Applicant's address",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.address.label'
          }
        }
      ]
    },
    {
      id: 'senior-pass',
      conditional: field('applicant.dob').isBefore().date('1950-01-01'),
      title: {
        id: 'v2.event.tennis-club-membership.action.declare.form.section.senior-pass.title',
        defaultMessage: 'Assign senior pass for applicant',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'senior-pass.id',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'Senior pass ID',
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.senior-pass.field.id.label'
          }
        },
        {
          id: 'senior-pass.recommender',
          type: 'CHECKBOX',
          required: true,
          parent: field('recommender.none'),
          defaultValue: false,
          conditionals: [],
          label: {
            defaultMessage: 'Does recommender have senior pass?',
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.senior-pass.field.recommender'
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
          type: 'CHECKBOX',
          required: false,
          conditionals: [],
          label: {
            defaultMessage: 'No recommender',
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.none.label'
          }
        },

        {
          id: 'recommender.name',
          type: FieldType.NAME,
          hideLabel: true,
          required: true,
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: "Recommender's name",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.firstname.label'
          }
        },
        {
          id: 'recommender.id',
          type: FieldType.TEXT,
          required: true,
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: "Recommender's membership ID",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.id.label'
          }
        }
      ]
    }
  ]
})

export const statusOptions = [
  {
    value: 'ALL',
    label: {
      defaultMessage: 'Any status',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusAny'
    }
  },
  {
    value: EventStatus.enum.CREATED,
    label: {
      defaultMessage: 'Draft',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusCreated'
    }
  },
  {
    value: EventStatus.enum.NOTIFIED,
    label: {
      defaultMessage: 'Notified',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusNotified'
    }
  },
  {
    value: EventStatus.enum.DECLARED,
    label: {
      defaultMessage: 'Declared',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusDeclared'
    }
  },
  {
    value: EventStatus.enum.VALIDATED,
    label: {
      defaultMessage: 'Validated',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusValidated'
    }
  },
  {
    value: EventStatus.enum.REGISTERED,
    label: {
      defaultMessage: 'Registered',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusRegistered'
    }
  },
  {
    value: EventStatus.enum.ARCHIVED,
    label: {
      defaultMessage: 'Archived',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusArchived'
    }
  }
]

export const timePeriodOptions = [
  {
    label: {
      defaultMessage: 'Last 7 days',
      description: 'Label for option of time period select: last 7 days',
      id: 'form.section.label.timePeriodLast7Days'
    },
    value: `${format(subDays(new Date(), 7), 'yyyy-MM-dd')},${format(
      new Date(),
      'yyyy-MM-dd'
    )}`
  },
  {
    label: {
      defaultMessage: 'Last 30 days',
      description: 'Label for option of time period select: last 30 days',
      id: 'form.section.label.timePeriodLast30Days'
    },
    value: `${format(subMonths(new Date(), 1), 'yyyy-MM-dd')},${format(
      new Date(),
      'yyyy-MM-dd'
    )}`
  },
  {
    label: {
      defaultMessage: 'Last 90 days',
      description: 'Label for option of time period select: last 90 days',
      id: 'form.section.label.timePeriodLast90Days'
    },
    value: `${format(subQuarters(new Date(), 1), 'yyyy-MM-dd')},${format(
      new Date(),
      'yyyy-MM-dd'
    )}`
  },
  {
    label: {
      defaultMessage: 'Last year',
      description: 'Label for option of time period select: last year',
      id: 'form.section.label.timePeriodLastYear'
    },
    value: `${format(subYears(new Date(), 1), 'yyyy-MM-dd')},${format(
      new Date(),
      'yyyy-MM-dd'
    )}`
  }
]
