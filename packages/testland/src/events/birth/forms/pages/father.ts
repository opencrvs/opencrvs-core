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
  AddressType,
  and,
  ConditionalType,
  defineFormPage,
  FieldType,
  never,
  field,
  user
} from '@opencrvs/toolkit/events'
import { or, not } from '@opencrvs/toolkit/conditionals'

import {
  farajalandNameConfig,
  invalidNameValidator,
  nationalIdValidator
} from '@countryconfig/events/birth/validators'
import { InformantType } from './informant'
import {
  educationalAttainmentOptions,
  IdType,
  idTypeOptions,
  maritalStatusOptions,
  yesNoRadioOptions,
  YesNoTypes,
  emptyMessage,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators
} from '@countryconfig/events/utils'
import {
  getMOSIPIntegrationFields,
  connectToMOSIPIdReader,
  connectToMOSIPVerificationStatus
} from '@countryconfig/events/mosip'

export const requireFatherDetails = or(
  field('father.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.FATHER)
)

export const father = defineFormPage({
  id: 'father',
  title: {
    defaultMessage: "Father's details",
    description: 'Form section title for fathers details',
    id: 'form.section.father.title'
  },
  fields: [
    {
      id: 'father.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: "Father's details are not available",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.FATHER)
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('father.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    {
      id: 'father.details.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.FATHER)
          )
        }
      ]
    },
    {
      id: 'father.reason',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('father.detailsNotAvailable').isEqualTo(true),
            not(field('informant.relation').isEqualTo(InformantType.FATHER))
          )
        }
      ]
    },
    // fields:
    // father.verified, father.query-params, father.verify-nid-http-fetch,
    // father.fetch-loader, father.id-reader
    ...getMOSIPIntegrationFields('father', {
      existingConditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    }),
    connectToMOSIPIdReader(
      {
        id: 'father.name',
        type: FieldType.NAME,
        required: true,
        configuration: farajalandNameConfig,
        hideLabel: true,
        label: {
          defaultMessage: "Father's name",
          description: 'This is the label for the field',
          id: 'event.birth.action.declare.form.section.father.field.name.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: requireFatherDetails
          }
        ],
        validation: [invalidNameValidator('father.name')]
      },
      {
        valuePath: 'data.name',
        disableIf: ['pending', 'verified', 'authenticated']
      }
    ),
    connectToMOSIPIdReader(
      {
        id: 'father.dob',
        type: 'DATE',
        analytics: true,
        required: true,
        secured: true,
        validation: [
          {
            message: {
              defaultMessage: 'Must be a valid Birthdate',
              description: 'This is the error message for invalid date',
              id: 'event.birth.action.declare.form.section.person.field.dob.error'
            },
            validator: field('father.dob').isBefore().now()
          },
          {
            message: {
              defaultMessage: "Birth date must be before child's birth date",
              description:
                "This is the error message for a birth date after child's birth date",
              id: 'event.birth.action.declare.form.section.person.dob.afterChild'
            },
            validator: field('father.dob').isBefore().date(field('child.dob'))
          }
        ],
        label: {
          defaultMessage: 'Date of birth',
          description: 'This is the label for the field',
          id: 'event.birth.action.declare.form.section.person.field.dob.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              not(field('father.dobUnknown').isEqualTo(true)),
              requireFatherDetails
            )
          }
        ]
      },
      {
        valuePath: 'data.birthDate',
        disableIf: ['pending', 'verified', 'authenticated']
      }
    ),
    connectToMOSIPIdReader(
      {
        id: 'father.dobUnknown',
        type: FieldType.CHECKBOX,
        label: {
          defaultMessage: 'Exact date of birth unknown',
          description: 'This is the label for the field',
          id: 'event.birth.action.declare.form.section.person.field.age.checkbox.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: requireFatherDetails
          },
          {
            type: ConditionalType.DISPLAY_ON_REVIEW,
            conditional: never()
          }
        ]
      },
      {
        valuePath: 'data.dobUnknown',
        disableIf: ['pending', 'verified', 'authenticated']
      }
    ),
    connectToMOSIPVerificationStatus(
      {
        id: 'father.age',
        type: FieldType.AGE,
        analytics: true,
        required: true,
        label: {
          defaultMessage: 'Age of father (at the time of event)',
          description: 'This is the label for the field',
          id: 'event.birth.action.declare.form.section.father.field.age.label'
        },
        configuration: {
          asOfDate: field('child.dob'),
          postfix: {
            defaultMessage: 'years',
            description: 'This is the postfix for age field',
            id: 'event.birth.action.declare.form.section.person.field.age.postfix'
          }
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              field('father.dobUnknown').isEqualTo(true),
              requireFatherDetails
            )
          }
        ],
        validation: [
          {
            validator: field('father.age').asAge().isBetween(12, 120),
            message: {
              defaultMessage: 'Age must be between 12 and 120',
              description: 'Error message for invalid age',
              id: 'event.action.declare.form.section.person.field.age.error'
            }
          }
        ]
      },
      { disableIf: ['pending', 'verified', 'authenticated'] }
    ),
    {
      id: 'father.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.nationality.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ],
      defaultValue: 'FAR'
    },
    connectToMOSIPIdReader(
      {
        id: 'father.idType',
        type: FieldType.SELECT,
        required: true,
        label: {
          defaultMessage: 'Type of ID',
          description: 'This is the label for the field',
          id: 'event.birth.action.declare.form.section.person.field.idType.label'
        },
        options: idTypeOptions,
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: requireFatherDetails
          }
        ]
      },
      {
        valuePath: 'data.idType',
        hideIf: ['authenticated'],
        disableIf: ['pending', 'verified']
      }
    ),
    connectToMOSIPIdReader(
      {
        id: 'father.nid',
        type: FieldType.ID,
        required: true,
        label: {
          defaultMessage: 'ID Number',
          description: 'This is the label for the field',
          id: 'event.birth.action.declare.form.section.person.field.nid.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              field('father.idType').isEqualTo(IdType.NATIONAL_ID),
              requireFatherDetails
            )
          }
        ],
        validation: [
          nationalIdValidator('father.nid'),
          {
            message: {
              defaultMessage: 'National id must be unique',
              description: 'This is the error message for non-unique ID Number',
              id: 'event.birth.action.declare.form.nid.unique'
            },
            validator: and(
              not(field('father.nid').isEqualTo(field('mother.nid'))),
              not(field('father.nid').isEqualTo(field('informant.nid')))
            )
          }
        ]
      },
      {
        valuePath: 'data.nid',
        hideIf: ['authenticated'],
        disableIf: ['pending', 'verified']
      }
    ),
    connectToMOSIPIdReader(
      {
        id: 'father.passport',
        type: FieldType.TEXT,
        required: true,
        label: {
          defaultMessage: 'ID Number',
          description: 'This is the label for the field',
          id: 'event.birth.action.declare.form.section.person.field.passport.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              field('father.idType').isEqualTo(IdType.PASSPORT),
              requireFatherDetails
            )
          }
        ]
      },
      {
        valuePath: 'data.passport',
        hideIf: ['authenticated'],
        disableIf: ['pending', 'verified']
      }
    ),
    connectToMOSIPIdReader(
      {
        id: 'father.brn',
        type: FieldType.TEXT,
        required: true,
        label: {
          defaultMessage: 'ID Number',
          description: 'This is the label for the field',
          id: 'event.birth.action.declare.form.section.person.field.brn.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              field('father.idType').isEqualTo(
                IdType.BIRTH_REGISTRATION_NUMBER
              ),
              requireFatherDetails
            )
          }
        ]
      },
      {
        valuePath: 'data.brn',
        hideIf: ['authenticated'],
        disableIf: ['pending', 'verified']
      }
    ),
    {
      id: 'father.addressDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.addressHelper.label'
      },
      configuration: {
        styles: { fontVariant: 'h3' }
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        },
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.addressSameAs',
      type: FieldType.RADIO_GROUP,
      options: yesNoRadioOptions,
      required: true,
      label: {
        defaultMessage: "Same as mother's usual place of residence?",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.address.addressSameAs.label'
      },
      parent: field('mother.detailsNotAvailable'),
      // Keep default address when mother details is updated
      defaultValue: YesNoTypes.NO,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.detailsNotAvailable').isFalsy(),
            field('father.detailsNotAvailable').isFalsy()
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('father.addressSameAs').isEqualTo(YesNoTypes.YES)
        }
      ]
    },
    {
      id: 'father.address',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      secured: true,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireFatherDetails,
            not(field('father.addressSameAs').isEqualTo(YesNoTypes.YES))
          )
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('father.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'father.address',
          defaultStreetAddressConfiguration
        )
      ],
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('administrativeAreaId')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },
    {
      id: 'father.addressDivider2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.maritalStatus',
      type: FieldType.SELECT,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Marital Status',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.maritalStatus.label'
      },
      options: maritalStatusOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.educationalAttainment',
      type: FieldType.SELECT,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Level of education',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.educationalAttainment.label'
      },
      options: educationalAttainmentOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.occupation',
      type: FieldType.TEXT,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.occupation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    }
  ]
})
