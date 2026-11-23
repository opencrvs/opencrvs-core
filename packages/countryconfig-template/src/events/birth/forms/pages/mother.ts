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
  PageTypes,
  field,
  user
} from '@opencrvs/toolkit/events'
import { or, not, never } from '@opencrvs/toolkit/conditionals'
import {
  invalidNameValidator,
  nationalIdValidator,
  farajalandNameConfig
} from '@countryconfig/events/birth/validators'
import { InformantType } from './informant'

import {
  IdType,
  idTypeOptions,
  educationalAttainmentOptions,
  maritalStatusOptions,
  emptyMessage,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators
} from '@countryconfig/events/utils'

export const requireMotherDetails = or(
  field('mother.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.MOTHER)
)

export const mother = defineFormPage({
  id: 'mother',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Mother's details",
    description: 'Form section title for mothers details',
    id: 'form.section.mother.title'
  },
  fields: [
    {
      id: 'mother.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Mother's details are not available",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.MOTHER)
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('mother.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    {
      id: 'mother.details.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.MOTHER)
          )
        }
      ]
    },
    {
      id: 'mother.reason',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.detailsNotAvailable').isEqualTo(true),
            not(field('informant.relation').isEqualTo(InformantType.MOTHER))
          )
        }
      ]
    },
    {
      id: 'mother.name',
      type: FieldType.NAME,
      required: true,
      configuration: farajalandNameConfig,
      hideLabel: true,
      label: {
        defaultMessage: "Mother's name",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.name.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      validation: [invalidNameValidator('mother.name')]
    },
    {
      id: 'mother.dob',
      type: 'DATE',
      required: true,
      secured: true,
      analytics: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid birth date',
            description: 'This is the error message for invalid date',
            id: 'event.birth.action.declare.form.section.person.field.dob.error'
          },
          validator: field('mother.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before child's birth date",
            description:
              "This is the error message for a birth date after child's birth date",
            id: 'event.birth.action.declare.form.section.person.dob.afterChild'
          },
          validator: field('mother.dob').isBefore().date(field('child.dob'))
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
            not(field('mother.dobUnknown').isEqualTo(true)),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: 'mother.dobUnknown',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.age.checkbox.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'mother.age',
      type: FieldType.AGE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Age of mother (at the time of event)',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.age.label'
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
            field('mother.dobUnknown').isEqualTo(true),
            requireMotherDetails
          )
        }
      ],
      validation: [
        {
          validator: field('mother.age').asAge().isBetween(12, 120),
          message: {
            defaultMessage: 'Age must be between 12 and 120',
            description: 'Error message for invalid age',
            id: 'event.action.declare.form.section.person.field.age.error'
          }
        }
      ]
    },
    {
      id: 'mother.nationality',
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
          conditional: requireMotherDetails
        }
      ],
      defaultValue: 'FAR'
    },
    {
      id: 'mother.idType',
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
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.nid',
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
            field('mother.idType').isEqualTo(IdType.NATIONAL_ID),
            requireMotherDetails
          )
        }
      ],
      validation: [
        nationalIdValidator('mother.nid'),
        {
          message: {
            defaultMessage: 'National id must be unique',
            description: 'This is the error message for non-unique ID Number',
            id: 'event.birth.action.declare.form.nid.unique'
          },
          validator: and(
            not(field('mother.nid').isEqualTo(field('father.nid'))),
            not(field('mother.nid').isEqualTo(field('informant.nid')))
          )
        }
      ]
    },
    {
      id: 'mother.passport',
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
            field('mother.idType').isEqualTo(IdType.PASSPORT),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: 'mother.brn',
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
            field('mother.idType').isEqualTo(IdType.BIRTH_REGISTRATION_NUMBER),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: 'mother.addressDivider1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.addressHelper',
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
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.address',
      type: FieldType.ADDRESS,
      required: true,
      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('mother.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'mother.address',
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
      id: 'mother.addressDivider2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.maritalStatus',
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
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.educationalAttainment',
      type: FieldType.SELECT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Level of education',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.educationalAttainment.label'
      },
      options: educationalAttainmentOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.occupation',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.occupation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.previousBirths',
      type: FieldType.NUMBER,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'No. of previous births',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.previousBirths.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      configuration: {
        integer: true,
        min: 0
      }
    }
  ]
})
