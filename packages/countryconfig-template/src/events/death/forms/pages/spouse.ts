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
  or,
  user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'
import {
  farajalandNameConfig,
  invalidNameValidator,
  nationalIdValidator
} from '@countryconfig/events/birth/validators'

import { InformantType } from './informant'
import {
  IdType,
  idTypeOptions,
  yesNoRadioOptions,
  YesNoTypes,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  emptyMessage
} from '@countryconfig/events/utils'

const requireSpouseDetails = or(
  field('spouse.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.SPOUSE)
)

export const spouse = defineFormPage({
  id: 'spouse',
  title: {
    defaultMessage: 'Spouse details',
    description: 'Form section title for spouse details',
    id: 'form.section.spouse.title'
  },
  fields: [
    {
      id: 'spouse.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Spouse's details are not available",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.SPOUSE)
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('spouse.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    {
      id: 'spouse.details.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.SPOUSE)
          )
        }
      ]
    },
    {
      id: 'spouse.reason',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.detailsNotAvailable').isEqualTo(true),
            not(field('informant.relation').isEqualTo(InformantType.SPOUSE))
          )
        }
      ]
    },
    {
      id: 'spouse.name',
      configuration: farajalandNameConfig,
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: "Spouse's name",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.name.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ],
      validation: [invalidNameValidator('spouse.name')]
    },
    {
      id: 'spouse.dob',
      type: FieldType.DATE,
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'event.death.action.declare.form.section.spouse.field.dob.error'
          },
          validator: field('spouse.dob').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.dob.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('spouse.dobUnknown').isEqualTo(true)),
            requireSpouseDetails
          )
        }
      ]
    },
    {
      id: 'spouse.dobUnknown',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.age.checkbox.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'spouse.age',
      type: FieldType.AGE,
      required: true,
      label: {
        defaultMessage: 'Age of spouse (at the time of event)',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.age.label'
      },
      configuration: {
        asOfDate: field('eventDetails.date'),
        postfix: {
          defaultMessage: 'years',
          description: 'This is the postfix for age field',
          id: 'event.death.action.declare.form.section.spouse.field.age.postfix'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.dobUnknown').isEqualTo(true),
            requireSpouseDetails
          )
        }
      ],
      validation: [
        {
          validator: field('spouse.age').asAge().isBetween(12, 120),
          message: {
            defaultMessage: 'Age must be between 12 and 120',
            description: 'Error message for invalid age',
            id: 'event.action.declare.form.section.person.field.age.error'
          }
        }
      ]
    },
    {
      id: 'spouse.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.nationality.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ],
      defaultValue: 'FAR'
    },
    {
      id: 'spouse.idType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.idType.label'
      },
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ]
    },
    {
      id: 'spouse.nid',
      type: FieldType.ID,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.nid.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.idType').isEqualTo(IdType.NATIONAL_ID),
            requireSpouseDetails
          )
        }
      ],
      validation: [
        nationalIdValidator('spouse.nid'),
        {
          message: {
            defaultMessage: 'National id must be unique',
            description: 'This is the error message for non-unique ID Number',
            id: 'event.death.action.declare.form.nid.unique'
          },
          validator: and(
            not(field('spouse.nid').isEqualTo(field('informant.nid'))),
            not(field('spouse.nid').isEqualTo(field('deceased.nid')))
          )
        }
      ]
    },
    {
      id: 'spouse.passport',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.passport.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.idType').isEqualTo(IdType.PASSPORT),
            requireSpouseDetails
          )
        }
      ]
    },
    {
      id: 'spouse.brn',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.brn.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.idType').isEqualTo(IdType.BIRTH_REGISTRATION_NUMBER),
            requireSpouseDetails
          )
        }
      ]
    },
    {
      id: 'spouse.addressDivider1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.idType').isEqualTo(IdType.BIRTH_REGISTRATION_NUMBER),
            requireSpouseDetails
          )
        }
      ]
    },
    {
      id: 'spouse.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.addressHelper.label'
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
          conditional: and(
            field('spouse.idType').isEqualTo(IdType.BIRTH_REGISTRATION_NUMBER),
            requireSpouseDetails
          )
        }
      ]
    },
    {
      id: 'spouse.addressSameAs',
      type: FieldType.RADIO_GROUP,
      options: yesNoRadioOptions,
      required: true,
      label: {
        defaultMessage: "Same as deceased's usual place of residence?",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.address.addressSameAs.label'
      },
      defaultValue: YesNoTypes.YES,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('spouse.addressSameAs').isEqualTo(YesNoTypes.YES)
        }
      ]
    },
    {
      id: 'spouse.address',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireSpouseDetails,
            field('spouse.addressSameAs').isEqualTo(YesNoTypes.NO)
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
          validator: field('spouse.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'spouse.address',
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
      id: 'spouse.addressDivider2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ]
    }
  ]
})
