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
  defineActionForm,
  defineConfig,
  defineDeclarationForm,
  FieldType,
  PageTypes,
  field,
  event,
  user,
  or,
  not,
  defineConditional,
  never,
  now,
  FieldConfig
} from '@opencrvs/toolkit/events'
import { getMOSIPIntegrationFields } from './mosip'

import { MAX_NAME_LENGTH } from './birth/validators'
import { Event } from './utils/types'

function applicantAddressFields() {
  const isDomesticAddress = field('applicant.address')
    .get('country')
    .isEqualTo('FAR')
  const isInternationalAddress = not(
    or(
      field('applicant.address').get('country').isEqualTo('FAR'),
      field('applicant.address').get('country').isFalsy()
    )
  )
  return [
    {
      id: 'applicant.address',
      type: FieldType.FIELD_GROUP,
      label: {
        defaultMessage: "Applicant's address",
        description: 'This is the label for the field',
        id: 'event.tennis-club-membership.action.declare.form.section.who.field.address.label'
      },
      fields: [
        {
          id: 'country',
          type: FieldType.COUNTRY,
          defaultValue: 'FAR',
          label: {
            defaultMessage: 'Country',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.address.country.label'
          }
        },
        {
          id: 'domestic',
          type: FieldType.FIELD_GROUP,
          label: {
            defaultMessage: '',
            description: '',
            id: 'form.field.label.empty'
          },
          conditionals: [{ type: 'SHOW', conditional: isDomesticAddress }],
          fields: [
            {
              id: 'province',
              type: FieldType.ADMINISTRATIVE_AREA,
              label: {
                defaultMessage: 'Province',
                description: 'This is the label for the field',
                id: 'event.tennis-club-membership.action.declare.form.section.who.field.address.province.label'
              },
              defaultValue: user('primaryOfficeId').locationLevel('province'),
              configuration: {
                type: 'ADMIN_STRUCTURE'
              }
            },
            {
              id: 'district',
              type: FieldType.ADMINISTRATIVE_AREA,
              label: {
                defaultMessage: 'District',
                description: 'This is the label for the field',
                id: 'event.tennis-club-membership.action.declare.form.section.who.field.address.district.label'
              },
              defaultValue: user('primaryOfficeId').locationLevel('district'),
              parent: field('applicant.address').getByPath([
                'domestic',
                'province'
              ]),
              configuration: {
                type: 'ADMIN_STRUCTURE',
                partOf: field('applicant.address').getByPath([
                  'domestic',
                  'province'
                ])
              },
              conditionals: [
                {
                  type: ConditionalType.SHOW,
                  conditional: not(
                    field('applicant.address')
                      .getByPath(['domestic', 'province'])
                      .isFalsy()
                  )
                }
              ]
            }
          ]
        },
        {
          id: 'international',
          type: FieldType.FIELD_GROUP,
          label: {
            defaultMessage: '',
            description: '',
            id: 'form.field.label.empty'
          },
          conditionals: [{ type: 'SHOW', conditional: isInternationalAddress }],
          fields: [
            {
              id: 'province',
              type: FieldType.TEXT,
              label: {
                defaultMessage: 'Province',
                description: 'This is the label for the field',
                id: 'event.tennis-club-membership.action.declare.form.section.who.field.address.province.label'
              }
            },
            {
              id: 'district',
              type: FieldType.TEXT,
              label: {
                defaultMessage: 'District',
                description: 'This is the label for the field',
                id: 'event.tennis-club-membership.action.declare.form.section.who.field.address.district.label'
              }
            }
          ]
        }
      ]
    }
  ] satisfies FieldConfig[]
}

const TENNIS_CLUB_DECLARATION_REVIEW = {
  title: {
    id: 'event.tennis-club-membership.action.declare.form.review.title',
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
        id: 'event.birth.action.declare.form.review.comment.label',
        description: 'Label for the comment field in the review section'
      }
    },
    {
      type: FieldType.SIGNATURE,
      id: 'review.signature',
      label: {
        defaultMessage: 'Signature of informant',
        id: 'event.birth.action.declare.form.review.signature.label',
        description: 'Label for the signature field in the review section'
      },
      signaturePromptLabel: {
        id: 'signature.upload.modal.title',
        defaultMessage: 'Draw signature',
        description: 'Title for the modal to draw signature'
      }
    },
    {
      type: FieldType.ALPHA_PRINT_BUTTON,
      id: 'review.print',
      label: {
        defaultMessage: 'Print declaration',
        description: 'Print',
        id: 'event.tennis-club-membership.action.declare.form.review.print.label'
      },
      configuration: {
        template: 'v2.tennis-club-membership-certified-certificate',
        buttonLabel: {
          defaultMessage: 'Print declaration summary',
          description: "Print button's label",
          id: 'event.tennis-club-membership.action.declare.form.review.print.button.label'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            user.hasRole('LOCAL_REGISTRAR'),
            not(event.hasAction(ActionType.DECLARE)),
            not(event.hasAction(ActionType.NOTIFY))
          )
        }
      ]
    },
    {
      type: FieldType.ALPHA_PRINT_BUTTON,
      id: 'review.print-declaration',
      label: {
        defaultMessage: 'Print declaration for hospital clerk',
        description: 'Print',
        id: 'event.tennis-club-membership.action.declare.form.review.print-record.label'
      },
      configuration: {
        template: 'v2.tennis-club-membership-certificate-alpha',
        buttonLabel: {
          defaultMessage: 'Print declaration summary by hospital clerk',
          description: "Print button's label",
          id: 'event.tennis-club-membership.action.declare.form.review.print.button.label'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: user.hasRole('HOSPITAL_CLERK')
        }
      ]
    }
  ]
}

const TENNIS_CLUB_DECLARATION_FORM = defineDeclarationForm({
  label: {
    id: 'event.tennis-club-membership.action.declare.form.label',
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'applicant',
      type: PageTypes.enum.FORM,
      title: {
        id: 'event.tennis-club-membership.action.declare.form.section.who.title',
        defaultMessage: 'Who is applying for the membership?',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'applicant.name',
          type: FieldType.NAME,
          label: {
            defaultMessage: 'Name of applicant',
            description: 'This is the title for the name field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.name.label'
          },
          hideLabel: true,
          required: true,
          defaultValue: {
            firstname: user('firstname'),
            middlename: user('middlename'),
            surname: user('surname')
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
                id: 'error.invalidName'
              }
            }
          ],
          configuration: {
            name: {
              firstname: { required: true },
              middlename: { required: false },
              surname: { required: true }
            },
            maxLength: MAX_NAME_LENGTH
          }
        },
        {
          id: 'applicant.registrationDuration',
          analytics: true,
          type: FieldType.NUMBER_WITH_UNIT,
          label: {
            defaultMessage: 'Registration duration',
            description: 'This is the label for the field',
            id: 'event.tennis-club.registrationDuration.label'
          },
          placeholder: {
            defaultMessage: 'Time Unit',
            description: 'This is the placeholder for the field',
            id: 'event.tennis-club.registrationDuration.placeholder'
          },
          options: [
            {
              value: 'Days',
              label: {
                id: 'unit.days',
                defaultMessage: 'Days',
                description: 'Days'
              }
            },
            {
              value: 'Hours',
              label: {
                id: 'unit.hours',
                defaultMessage: 'Hours',
                description: 'Hours'
              }
            },
            {
              value: 'Minutes',
              label: {
                id: 'unit.minutes',
                defaultMessage: 'Minutes',
                description: 'Minutes'
              }
            }
          ],
          configuration: {
            min: 0,
            numberFieldPlaceholder: {
              defaultMessage: 'Interval',
              description: 'This is the placeholder for the field',
              id: 'event.birth.action.declare.form.section.child.field.birthDuration.placeholder'
            }
          },
          validation: [
            {
              message: {
                defaultMessage: 'Number and unit required',
                description: 'This is the error message for invalid duration',
                id: 'event.birth.action.declare.form.section.child.field.birthDuration.error'
              },
              validator: or(
                and(
                  field('applicant.registrationDuration')
                    .get('numericValue')
                    .isFalsy(),
                  field('applicant.registrationDuration').get('unit').isFalsy()
                ),
                not(
                  or(
                    field('applicant.registrationDuration')
                      .get('numericValue')
                      .isFalsy(),
                    field('applicant.registrationDuration')
                      .get('unit')
                      .isFalsy()
                  )
                )
              )
            }
          ]
        },
        {
          id: 'applicant.dob',
          type: FieldType.DATE,
          required: true,
          analytics: true,
          defaultValue: now(),
          validation: [
            {
              message: {
                defaultMessage: 'Please enter a valid date',
                description: 'This is the error message for invalid date',
                id: 'event.tennis-club-membership.action.declare.form.section.who.field.dob.error'
              },
              validator: field('applicant.dob').isBefore().now()
            }
          ],
          label: {
            defaultMessage: "Applicant's date of birth",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.dob.label'
          }
        },
        ...applicantAddressFields(),
        {
          id: 'applicant.tob',
          type: FieldType.TIME,
          required: false,
          defaultValue: now(),
          configuration: {
            use12HourFormat: true
          },
          label: {
            defaultMessage: "Applicant's time of birth",
            description: 'This is the label for the time of birth field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.tob.label'
          }
        },
        {
          id: 'applicant.image',
          type: 'FILE',
          required: false,
          uncorrectable: true,
          configuration: {
            maxImageSize: { targetSize: { height: 600, width: 600 } }
          },
          label: {
            defaultMessage: "Applicant's profile picture",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.image.label'
          }
        },
        {
          id: 'applicant.idImage',
          type: 'FILE_WITH_OPTIONS',
          required: false,
          uncorrectable: true,
          options: [
            {
              label: {
                id: 'event.tennis-club-membership.action.declare.form.section.who.field.idImage.option.front.label',
                defaultMessage: 'Upload front side of ID',
                description: 'Option to upload front side of ID'
              },
              value: 'ID_FRONT'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.declare.form.section.who.field.idImage.option.back.label',
                defaultMessage: 'Upload back side of ID',
                description: 'Option to upload back side of ID'
              },
              value: 'ID_BACK'
            }
          ],
          label: {
            defaultMessage: "Image of Applicant's ID",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.idImage.label'
          }
        },
        {
          id: 'applicant.image.label',
          type: 'TEXT',
          required: false,
          label: {
            defaultMessage: "Applicant's profile picture description",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.image.label'
          }
        },
        {
          id: 'applicant.isRecommendedByFieldAgent',
          type: FieldType.CHECKBOX,
          analytics: true,
          required: false,
          label: {
            defaultMessage:
              'Field shown when field agent is submitting application.',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.isRecommendedByFieldAgent.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: or(
                user.hasRole('SOCIAL_WORKER'),
                user.hasRole('FIELD_AGENT'),
                user.hasRole('HOSPITAL_CLERK')
              )
            }
          ]
        }
      ]
    },
    {
      id: 'senior-pass',
      type: PageTypes.enum.FORM,
      conditional: field('applicant.dob')
        .isBefore()
        .days(365 * 60 + 15)
        .inPast(),
      title: {
        id: 'event.tennis-club-membership.action.declare.form.section.senior-pass.title',
        defaultMessage: 'Assign senior pass for applicant',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'senior-pass.id',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Senior pass ID',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.senior-pass.field.id.label'
          }
        }
      ]
    },
    {
      id: 'recommender',
      type: PageTypes.enum.FORM,
      title: {
        id: 'event.tennis-club-membership.action.declare.form.section.recommender.title',
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
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.none.label'
          }
        },
        {
          id: 'recommender.search',
          type: FieldType.SEARCH,
          label: {
            defaultMessage: 'Registration Number of recommender',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.search.label'
          },
          helperText: {
            defaultMessage:
              'You can search tennis records created on Farajaland since beginning of 2023',
            description: 'This is the helper text for the field',
            id: 'tennis-club-membership.searchField.helperText'
          },
          configuration: {
            query: {
              type: 'or',
              clauses: [
                {
                  'legalStatuses.REGISTERED.registrationNumber': {
                    term: '{term}',
                    type: 'exact'
                  }
                }
              ]
            },
            limit: 10,
            offset: 0,
            validation: {
              validator: defineConditional({
                type: 'string',
                pattern: '^[A-Za-z0-9]{12}$',
                description: 'Must be alpha-numeric and 12 characters long'
              }),
              message: {
                defaultMessage:
                  'Invalid value: Must be alpha-numeric and 12 characters long',
                description: 'Error message for invalid value',
                id: 'tennis-club-membership.searchField.validation.invalid'
              }
            },
            indicators: {
              ok: {
                defaultMessage: 'Recommender found',
                description: 'OK button text',
                id: 'tennis-club-membership.searchField.indicators.ok'
              },
              clearModal: {
                title: {
                  defaultMessage: 'Clear recommender?',
                  description: 'Title for the clear confirmation modal',
                  id: 'tennis-club-membership.searchField.indicators.clearModal.title'
                },
                description: {
                  defaultMessage:
                    'This will remove the details of the current recommender.',
                  description: 'Description for the clear confirmation modal',
                  id: 'tennis-club-membership.searchField.indicators.clearModal.description'
                }
              }
            }
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            },
            {
              type: ConditionalType.DISPLAY_ON_REVIEW,
              conditional: never()
            }
          ]
        },
        {
          id: 'recommender1.heading',
          type: FieldType.HEADING,
          label: {
            defaultMessage: 'Recommender 1',
            description: 'This is the label for the field',
            id: `recommender1.heading.label`
          },
          configuration: { styles: { fontVariant: 'h3' } }
        },
        {
          id: 'recommender.name',
          configuration: { maxLength: MAX_NAME_LENGTH },
          type: FieldType.NAME,
          required: true,
          parent: field('recommender.search'),
          defaultValue: {
            firstname: user('firstname'),
            middlename: user('middlename'),
            surname: user('surname')
          },
          value: field('recommender.search').getByPath([
            'data',
            'firstResult',
            'declaration',
            'applicant.name'
          ]),
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          hideLabel: true,
          label: {
            defaultMessage: "Recommender's name",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.firstname.label'
          }
        },
        {
          id: 'recommender.device',
          type: 'TEXT',
          defaultValue: user('device'),
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: "Recommender's device",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.device'
          }
        },
        {
          id: 'recommender.fullHonorificName',
          type: 'TEXT',
          defaultValue: user('fullHonorificName'),
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: 'Recommender full honorific name',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender2.fullHonorificName'
          }
        },
        {
          id: 'recommender.role',
          type: 'TEXT',
          defaultValue: user('role'),
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: 'Recommender role',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.role'
          }
        },
        {
          id: 'recommender.id',
          type: 'TEXT',
          required: true,
          parent: field('recommender.search'),
          value: field('recommender.search').get(
            'data.firstResult.legalStatuses.REGISTERED.registrationNumber'
          ),
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: "Recommender's membership ID",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.id.label'
          }
        },
        {
          id: 'recommender2.heading',
          type: FieldType.HEADING,
          label: {
            defaultMessage: 'Recommender 2',
            description: 'This is the label for the field',
            id: `recommender2.heading.label`
          },
          configuration: { styles: { fontVariant: 'h3' } }
        },
        {
          id: 'recommender2.id',
          type: 'TEXT',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: 'Membership ID',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.id.label'
          }
        },
        {
          id: 'recommender3.heading',
          type: FieldType.HEADING,
          label: {
            defaultMessage: 'Recommender 3',
            description: 'This is the label for the field',
            id: `recommender3.heading.label`
          },
          configuration: { styles: { fontVariant: 'h3' } }
        },
        {
          id: 'recommender3.id',
          type: 'TEXT',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: 'Membership ID',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.id.label'
          }
        },
        {
          id: 'recommender4.heading',
          type: FieldType.HEADING,
          label: {
            defaultMessage: 'Recommender 4',
            description: 'This is the label for the field',
            id: `recommender4.heading.label`
          },
          configuration: { styles: { fontVariant: 'h3' } }
        },
        {
          id: 'recommender4.id',
          type: 'TEXT',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: 'Membership ID',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.id.label'
          }
        },
        {
          id: 'recommender5.heading',
          type: FieldType.HEADING,
          label: {
            defaultMessage: 'Recommender 5',
            description: 'This is the label for the field',
            id: `recommender5.heading.label`
          },
          configuration: { styles: { fontVariant: 'h3' } }
        },
        {
          id: 'recommender5.id',
          type: 'TEXT',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: 'Membership ID',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.id.label'
          }
        }
      ]
    }
  ]
})

const TENNIS_CLUB_MEMBERSHIP_CERTIFICATE_COLLECTOR_FORM = defineActionForm({
  label: {
    id: 'event.tennis-club-membership.action.certificate.form.label',
    defaultMessage: 'Tennis club membership certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'collector',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.tennis-club-membership.action.certificate.form.section.who.title',
        defaultMessage: 'Print certified copy',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.requesterId',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Requester',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.certificate.form.section.requester.label'
          },
          options: [
            {
              label: {
                id: 'event.tennis-club-membership.action.certificate.form.section.requester.informant.label',
                defaultMessage: 'Print and issue Informant',
                description: 'This is the label for the field'
              },
              value: 'INFORMANT'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.certificate.form.section.requester.other.label',
                defaultMessage: 'Print and issue someone else',
                description: 'This is the label for the field'
              },
              value: 'OTHER'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.certificate.form.section.requester.printInAdvance.label',
                defaultMessage: 'Print in advance',
                description: 'This is the label for the field'
              },
              value: 'PRINT_IN_ADVANCE'
            }
          ]
        },
        {
          id: 'collector.OTHER.idType',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Select Type of ID',
            description: 'This is the label for selecting the type of ID',
            id: 'event.tennis-club-membership.action.form.section.idType.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').inArray(['OTHER'])
            }
          ],
          options: [
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.passport.label',
                defaultMessage: 'Passport',
                description: 'Option for selecting Passport as the ID type'
              },
              value: 'PASSPORT'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.drivingLicense.label',
                defaultMessage: 'Driving License',
                description:
                  'Option for selecting Driving License as the ID type'
              },
              value: 'DRIVING_LICENSE'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.refugeeNumber.label',
                defaultMessage: 'Refugee Number',
                description:
                  'Option for selecting Refugee Number as the ID type'
              },
              value: 'REFUGEE_NUMBER'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.alienNumber.label',
                defaultMessage: 'Alien Number',
                description: 'Option for selecting Alien Number as the ID type'
              },
              value: 'ALIEN_NUMBER'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.eSignet.label',
                defaultMessage: 'e-Signet',
                description: 'Option for selecting e-Signet as the ID type'
              },
              value: 'E_SIGNET'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.other.label',
                defaultMessage: 'Other',
                description: 'Option for selecting Other as the ID type'
              },
              value: 'OTHER'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.form.section.idType.noId.label',
                defaultMessage: 'No ID',
                description: 'Option for selecting No ID as the ID type'
              },
              value: 'NO_ID'
            }
          ]
        },
        {
          id: 'collector.PASSPORT.details',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Passport Details',
            description: 'Field for entering Passport details',
            id: 'event.tennis-club-membership.action.form.section.passportDetails.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                field('collector.requesterId').inArray(['OTHER']),
                field('collector.OTHER.idType').inArray(['PASSPORT'])
              )
            }
          ]
        },
        {
          id: 'collector.DRIVING-LICENCE.details',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Driving License Details',
            description: 'Field for entering Driving License details',
            id: 'event.tennis-club-membership.action.form.section.drivingLicenseDetails.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                field('collector.requesterId').inArray(['OTHER']),
                field('collector.OTHER.idType').inArray(['DRIVING_LICENSE'])
              )
            }
          ]
        },
        {
          id: 'collector.REFUGEE-NUMBER.details',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Refugee Number Details',
            description: 'Field for entering Refugee Number details',
            id: 'event.tennis-club-membership.action.form.section.refugeeNumberDetails.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                field('collector.requesterId').inArray(['OTHER']),
                field('collector.OTHER.idType').inArray(['REFUGEE_NUMBER'])
              )
            }
          ]
        },
        {
          id: 'collector.ALIEN-NUMBER.details',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Alien Number Details',
            description: 'Field for entering Alien Number details',
            id: 'event.tennis-club-membership.action.form.section.alienNumberDetails.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                field('collector.requesterId').inArray(['OTHER']),
                field('collector.OTHER.idType').inArray(['ALIEN_NUMBER'])
              )
            }
          ]
        },
        {
          id: 'collector.OTHER.idTypeOther',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Other ID Type (if applicable)',
            description: 'Field for entering ID type if "Other" is selected',
            id: 'event.tennis-club-membership.action.form.section.idTypeOther.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                field('collector.requesterId').inArray(['OTHER']),
                field('collector.OTHER.idType').inArray(['OTHER'])
              )
            }
          ]
        },
        ...getMOSIPIntegrationFields('collector.OTHER', {
          existingConditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.OTHER.idType').isEqualTo('E_SIGNET')
            }
          ]
        }),
        {
          parent: [
            field(`collector.OTHER.verify-nid-http-fetch`),
            field(`collector.OTHER.id-reader`)
          ],
          id: 'collector.OTHER.firstName',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'First Name',
            description: 'This is the label for the first name field',
            id: 'event.tennis-club-membership.action.form.section.firstName.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').inArray(['OTHER'])
            },
            {
              type: ConditionalType.ENABLE,
              conditional: not(
                field('collector.OTHER.idType').isEqualTo('E_SIGNET')
              )
            }
          ],
          value: [
            field(`collector.OTHER.verify-nid-http-fetch`).get(
              'data.name.firstname'
            ),
            field(`collector.OTHER.id-reader`).get('data.name.firstname')
          ]
        },
        {
          parent: [
            field(`collector.OTHER.verify-nid-http-fetch`),
            field(`collector.OTHER.id-reader`)
          ],
          id: 'collector.OTHER.lastName',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Last Name',
            description: 'This is the label for the last name field',
            id: 'event.tennis-club-membership.action.form.section.lastName.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').inArray(['OTHER'])
            },
            {
              type: ConditionalType.ENABLE,
              conditional: not(
                field('collector.OTHER.idType').isEqualTo('E_SIGNET')
              )
            }
          ],
          value: [
            field(`collector.OTHER.verify-nid-http-fetch`).get(
              'data.name.surname'
            ),
            field(`collector.OTHER.id-reader`).get('data.name.surname')
          ]
        },
        {
          id: 'collector.OTHER.relationshipToMember',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Relationship to Member',
            description:
              'This is the label for the relationship to member field',
            id: 'event.tennis-club-membership.action.form.section.relationshipToMember.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').inArray(['OTHER'])
            }
          ]
        },
        {
          id: 'collector.OTHER.signedAffidavit',
          type: 'FILE',
          required: false,
          label: {
            defaultMessage: 'Signed Affidavit (Optional)',
            description: 'This is the label for uploading a signed affidavit',
            id: 'event.tennis-club-membership.action.form.section.signedAffidavit.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').inArray(['OTHER'])
            }
          ]
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
      fields: [
        {
          id: 'collector.identity.verify.data',
          type: FieldType.DATA,
          label: {
            defaultMessage: 'Applicant details',
            description: 'Title for the data section',
            id: 'event.tennis-club-membership.action.certificate.form.section.verifyIdentity.data.label'
          },
          configuration: {
            subtitle: {
              defaultMessage: 'Please verify the applicants identity',
              description: 'Subtitle for the data section',
              id: 'event.tennis-club-membership.action.certificate.form.section.verifyIdentity.data.subtitle'
            },
            data: [{ fieldId: 'applicant.name' }, { fieldId: 'applicant.dob' }]
          }
        }
      ],
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'event.tennis-club-membership.action.certificate.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'event.tennis-club-membership.action.certificate.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Print without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'event.tennis-club-membership.action.certificate.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector',
              description:
                'This is the body for the verification cancellation modal',
              id: 'event.tennis-club-membership.action.certificate.form.cancel.confirmation.body'
            }
          }
        }
      }
    },
    {
      id: 'collector.collect.payment',
      type: PageTypes.enum.FORM,
      title: {
        id: 'event.tennis-club-membership.action.print.collectPayment',
        defaultMessage: 'Collect Payment',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.collect.payment.data',
          type: FieldType.DATA,
          label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'event.tennis-club-membership.action.certificate.form.section.collectPayment.data.label'
          },
          configuration: {
            data: [
              {
                id: 'service',
                label: {
                  defaultMessage: 'Service',
                  description: 'Title for the data entry',
                  id: 'event.tennis-club-membership.action.certificate.form.section.collectPayment.service.label'
                },
                value: 'Member registration older than 30 years'
              },
              {
                id: 'fee',
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'event.tennis-club-membership.action.certificate.form.section.collectPayment.fee.label'
                },
                value: '$5.00'
              }
            ]
          }
        }
      ]
    }
  ]
})

export const tennisClubMembershipEvent = defineConfig({
  id: Event.TENNIS_CLUB_MEMBERSHIP,
  declaration: TENNIS_CLUB_DECLARATION_FORM,
  label: {
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this event is referred as in the system',
    id: 'event.tennis-club-membership.label'
  },
  title: {
    defaultMessage: '{applicant.name.firstname} {applicant.name.surname}',
    description: 'This is the title of the summary',
    id: 'event.tennis-club-membership.title'
  },
  fallbackTitle: {
    id: 'event.tennis-club-membership.fallbackTitle',
    defaultMessage: 'No name provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  summary: {
    fields: [
      {
        fieldId: 'applicant.name',
        emptyValueMessage: {
          defaultMessage: "Applicant's first name missing",
          description:
            "Shown when the applicant's first name is missing in summary",
          id: 'event.tennis-club-membership.summary.field.applicant.firstname.empty'
        },
        label: {
          defaultMessage: "Applicant's First Name",
          description: "Label for the applicant's first name field",
          id: 'event.tennis-club-membership.summary.field.applicant.firstname.label'
        }
      },
      {
        fieldId: 'recommender.name',
        emptyValueMessage: {
          defaultMessage: "Recommender's first name missing",
          description:
            'Shown when the recommender first name is missing in summary',
          id: 'event.tennis-club-membership.summary.field.recommender.firstname.empty'
        },
        label: {
          defaultMessage: "Recommender's First Name",
          description: 'Label for the recommender’s first name field',
          id: 'event.tennis-club-membership.summary.field.recommender.firstname.label'
        }
      },
      {
        fieldId: 'recommender.id',
        emptyValueMessage: {
          defaultMessage: "Recommender's id missing",
          description: 'Shown when the recommender id is missing in summary',
          id: 'event.tennis-club-membership.summary.field.recommender.id.empty'
        },
        label: {
          defaultMessage: "Recommender's ID",
          description: 'Label for the recommender’s ID field',
          id: 'event.tennis-club-membership.summary.field.recommender.id.label'
        }
      },
      {
        id: 'event.registeredAt',
        emptyValueMessage: {
          defaultMessage: 'No registration date',
          description: 'This is shown when there is no registration date',
          id: 'event.birth.summary.event.registeredAt.empty'
        },
        label: {
          defaultMessage: 'Registration date',
          description: 'This is the label for the registration date',
          id: 'event.birth.summary.event.registeredAt.label'
        },
        value: {
          defaultMessage:
            '{event.legalStatuses.REGISTERED.acceptedAt, date, ::dd MMMM yyyy}',
          description: 'This is the registration date value',
          id: 'event.birth.summary.event.registeredAt.value'
        }
      }
    ]
  },
  actions: [
    {
      type: ActionType.READ,
      label: {
        id: 'event.tennis-club-membership.action.read.label',
        defaultMessage: 'Read',
        description: 'Title of the review page'
      },
      review: TENNIS_CLUB_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.declare.label'
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
      }
    },
    {
      type: ActionType.PRINT_CERTIFICATE,
      label: {
        defaultMessage: 'Print certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.collect-certificate.label'
      },
      printForm: TENNIS_CLUB_MEMBERSHIP_CERTIFICATE_COLLECTOR_FORM
    },
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        defaultMessage: 'Request correction',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.requestCorrection.label'
      },
      correctionForm: {
        label: {
          id: 'event.tennis-club-membership.action.request-correction.label',
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
                      id: 'correction.corrector.anotherAgent',
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
            type: PageTypes.enum.FORM,
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
          },
          {
            id: 'correction-request.supporting-documents',
            type: PageTypes.enum.FORM,
            title: {
              id: 'form.section.documents.title',
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
            type: PageTypes.enum.FORM,
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
      }
    }
  ],
  advancedSearch: [
    {
      title: {
        defaultMessage: 'Registration details',
        description: 'The title of Registration details accordion',
        id: 'advancedSearch.form.registrationDetails'
      },
      fields: [
        event('legalStatuses.REGISTERED.registrationNumber').exact(),
        event('legalStatuses.REGISTERED.createdAtLocation').within(),
        event('legalStatuses.REGISTERED.acceptedAt').range(),
        event('status').exact(),
        event('updatedAt').range()
      ]
    },
    {
      title: {
        defaultMessage: "Applicant's details",
        description: 'Applicant details search field section title',
        id: 'event.tennis-club-membership.search.applicants'
      },
      fields: [
        field('applicant.name', {
          validations: [],
          conditionals: []
        }).fuzzy(),
        field('applicant.dob').range()
      ]
    },
    {
      title: {
        defaultMessage: "Recommender's details",
        description: 'Recommender details search field section title',
        id: 'event.tennis-club-membership.search.recommender'
      },
      fields: [
        field('recommender.name').fuzzy(),
        {
          fieldId: 'recommender.id',
          fieldType: 'field',
          type: FieldType.TEXT,
          config: {
            type: 'fuzzy',
            searchFields: [
              'recommender.id',
              'recommender2.id',
              'recommender3.id',
              'recommender4.id',
              'recommender5.id'
            ]
          },
          label: {
            defaultMessage: "Recommender's Id",
            description: 'Recommender id search field title',
            id: 'event.tennis-club-membership.search.recommender.id'
          }
        }
      ]
    }
  ]
})
