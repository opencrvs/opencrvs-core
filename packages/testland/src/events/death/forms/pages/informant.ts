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
  or,
  TranslationConfig,
  field,
  user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

import {
  farajalandNameConfig,
  invalidNameValidator,
  nationalIdValidator
} from '@countryconfig/events/birth/validators'

import {
  IdType,
  idTypeOptions,
  yesNoRadioOptions,
  YesNoTypes,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  createSelectOptions,
  emptyMessage
} from '@countryconfig/events/utils'
import {
  getMOSIPIntegrationFields,
  connectToMOSIPIdReader,
  connectToMOSIPVerificationStatus
} from '@countryconfig/events/mosip'

export const InformantType = {
  SPOUSE: 'SPOUSE',
  SON: 'SON',
  DAUGHTER: 'DAUGHTER',
  SON_IN_LAW: 'SON_IN_LAW',
  DAUGHTER_IN_LAW: 'DAUGHTER_IN_LAW',
  MOTHER: 'MOTHER',
  FATHER: 'FATHER',
  GRANDSON: 'GRANDSON',
  GRANDDAUGHTER: 'GRANDDAUGHTER',
  OTHER: 'OTHER'
} as const
export type InformantTypeKey = keyof typeof InformantType

const PHONE_NUMBER_REGEX = '^0(7|9)[0-9]{8}$'
const informantMessageDescriptors = {
  SPOUSE: {
    defaultMessage: 'Spouse',
    description: 'Label for option spouse',
    id: 'form.field.label.informantRelation.spouse'
  },
  SON: {
    defaultMessage: 'Son',
    description: 'Label for option son',
    id: 'form.field.label.informantRelation.son'
  },
  DAUGHTER: {
    defaultMessage: 'Daughter',
    description: 'Label for option daughter',
    id: 'form.field.label.informantRelation.daughter'
  },
  SON_IN_LAW: {
    defaultMessage: 'Son in law',
    description: 'Label for option son in law',
    id: 'form.field.label.informantRelation.sonInLaw'
  },
  DAUGHTER_IN_LAW: {
    defaultMessage: 'Daughter in law',
    description: 'Label for option daughter in law',
    id: 'form.field.label.informantRelation.daughterInLaw'
  },
  MOTHER: {
    defaultMessage: 'Mother',
    description: 'Label for option mother',
    id: 'form.field.label.informantRelation.mother'
  },
  FATHER: {
    defaultMessage: 'Father',
    description: 'Label for option father',
    id: 'form.field.label.informantRelation.father'
  },
  GRANDSON: {
    defaultMessage: 'Grandson',
    description: 'Label for option Grandson',
    id: 'form.field.label.informantRelation.grandson'
  },
  GRANDDAUGHTER: {
    defaultMessage: 'Granddaughter',
    description: 'Label for option Granddaughter',
    id: 'form.field.label.informantRelation.granddaughter'
  },
  OTHER: {
    defaultMessage: 'Someone else',
    description: 'Label for option someone else',
    id: 'form.field.label.informantRelation.others'
  }
} satisfies Record<keyof typeof InformantType, TranslationConfig>

const deathInformantTypeOptions = createSelectOptions(
  InformantType,
  informantMessageDescriptors
)

const informantOtherThanSpouse = and(
  not(field('informant.relation').inArray([InformantType.SPOUSE])),
  not(field('informant.relation').isFalsy())
)

export const informant = defineFormPage({
  id: 'informant',
  title: {
    defaultMessage: "Informant's details",
    description: 'Form section title for informants details',
    id: 'form.section.informant.title'
  },
  fields: [
    {
      id: 'informant.relation',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Informant type',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.relation.label'
      },
      options: deathInformantTypeOptions
    },
    {
      id: 'informant.other.relation',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Relationship to deceased',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.other.relation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informant.relation').isEqualTo(
            InformantType.OTHER
          )
        }
      ],
      parent: field('informant.relation')
    },
    // fields:
    // informant.verified, informant.query-params, informant.verify-nid-http-fetch,
    // informant.fetch-loader, informant.id-reader
    ...getMOSIPIntegrationFields('informant', {
      existingConditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: informantOtherThanSpouse
        }
      ]
    }),
    connectToMOSIPIdReader(
      {
        id: 'informant.name',
        configuration: farajalandNameConfig,
        type: FieldType.NAME,
        required: true,
        hideLabel: true,
        label: {
          defaultMessage: "Informant's name",
          description: 'This is the label for the field',
          id: 'event.death.action.declare.form.section.informant.field.name.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: informantOtherThanSpouse
          }
        ],
        validation: [invalidNameValidator('informant.name')],
        parent: field('informant.relation')
      },
      {
        valuePath: 'data.name',
        disableIf: ['pending', 'verified', 'authenticated']
      }
    ),
    connectToMOSIPIdReader(
      {
        id: 'informant.dob',
        type: FieldType.DATE,
        required: true,
        validation: [
          {
            message: {
              defaultMessage: 'Must be a valid Birthdate',
              description: 'This is the error message for invalid date',
              id: 'event.death.action.declare.form.section.informant.field.dob.error'
            },
            validator: field('informant.dob').isBefore().now()
          }
        ],
        label: {
          defaultMessage: 'Date of birth',
          description: 'This is the label for the field',
          id: 'event.death.action.declare.form.section.informant.field.dob.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              not(field('informant.dobUnknown').isEqualTo(true)),
              informantOtherThanSpouse
            )
          }
        ],
        parent: field('informant.relation')
      },
      {
        valuePath: 'data.birthDate',
        disableIf: ['pending', 'verified', 'authenticated']
      }
    ),
    connectToMOSIPIdReader(
      {
        id: 'informant.dobUnknown',
        type: FieldType.CHECKBOX,
        label: {
          defaultMessage: 'Exact date of birth unknown',
          description: 'This is the label for the field',
          id: 'event.death.action.declare.form.section.informant.field.age.checkbox.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: informantOtherThanSpouse
          },
          {
            type: ConditionalType.DISPLAY_ON_REVIEW,
            conditional: never()
          }
        ],
        parent: field('informant.relation')
      },
      {
        valuePath: 'data.dobUnknown',
        disableIf: ['pending', 'verified', 'authenticated']
      }
    ),
    connectToMOSIPVerificationStatus(
      {
        id: 'informant.age',
        type: FieldType.AGE,
        required: true,
        label: {
          defaultMessage: 'Age of informant (at the time of event)',
          description: 'This is the label for the field',
          id: 'event.death.action.declare.form.section.informant.field.age.label'
        },
        configuration: {
          asOfDate: field('eventDetails.date'),
          postfix: {
            defaultMessage: 'years',
            description: 'This is the postfix for age field',
            id: 'event.death.action.declare.form.section.informant.field.age.postfix'
          }
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              field('informant.dobUnknown').isEqualTo(true),
              informantOtherThanSpouse
            )
          }
        ],
        validation: [
          {
            validator: field('informant.age').asAge().isBetween(12, 120),
            message: {
              defaultMessage: 'Age must be between 12 and 120',
              description: 'Error message for invalid age',
              id: 'event.action.declare.form.section.person.field.age.error'
            }
          }
        ],
        parent: field('informant.relation')
      },
      { disableIf: ['pending', 'verified', 'authenticated'] }
    ),
    {
      id: 'informant.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.nationality.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: informantOtherThanSpouse
        }
      ],
      defaultValue: 'FAR',
      parent: field('informant.relation')
    },
    connectToMOSIPIdReader(
      {
        id: 'informant.idType',
        type: FieldType.SELECT,
        required: true,
        label: {
          defaultMessage: 'Type of ID',
          description: 'This is the label for the field',
          id: 'event.death.action.declare.form.section.informant.field.idType.label'
        },
        options: idTypeOptions,
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: informantOtherThanSpouse
          }
        ],
        parent: field('informant.relation')
      },
      {
        valuePath: 'data.idType',
        hideIf: ['authenticated'],
        disableIf: ['pending', 'verified']
      }
    ),
    connectToMOSIPIdReader(
      {
        id: 'informant.nid',
        type: FieldType.ID,
        required: true,
        label: {
          defaultMessage: 'ID Number',
          description: 'This is the label for the field',
          id: 'event.death.action.declare.form.section.informant.field.nid.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              field('informant.idType').isEqualTo(IdType.NATIONAL_ID),
              informantOtherThanSpouse
            )
          }
        ],
        validation: [
          nationalIdValidator('informant.nid'),
          {
            message: {
              defaultMessage: 'National id must be unique',
              description: 'This is the error message for non-unique ID Number',
              id: 'event.death.action.declare.form.nid.unique'
            },
            validator: and(
              not(field('informant.nid').isEqualTo(field('spouse.nid'))),
              not(field('informant.nid').isEqualTo(field('deceased.nid')))
            )
          }
        ],
        parent: field('informant.relation')
      },
      {
        valuePath: 'data.nid',
        hideIf: ['authenticated'],
        disableIf: ['pending', 'verified']
      }
    ),
    connectToMOSIPIdReader(
      {
        id: 'informant.passport',
        type: FieldType.TEXT,
        required: true,
        label: {
          defaultMessage: 'ID Number',
          description: 'This is the label for the field',
          id: 'event.death.action.declare.form.section.informant.field.passport.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              field('informant.idType').isEqualTo(IdType.PASSPORT),
              informantOtherThanSpouse
            )
          }
        ],
        parent: field('informant.relation')
      },
      {
        valuePath: 'data.passport',
        hideIf: ['authenticated'],
        disableIf: ['pending', 'verified']
      }
    ),
    connectToMOSIPIdReader(
      {
        id: 'informant.brn',
        type: FieldType.TEXT,
        required: true,
        label: {
          defaultMessage: 'ID Number',
          description: 'This is the label for the field',
          id: 'event.death.action.declare.form.section.informant.field.brn.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              field('informant.idType').isEqualTo(
                IdType.BIRTH_REGISTRATION_NUMBER
              ),
              informantOtherThanSpouse
            )
          }
        ],
        parent: field('informant.relation')
      },
      {
        valuePath: 'data.brn',
        hideIf: ['authenticated'],
        disableIf: ['pending', 'verified']
      }
    ),
    {
      id: 'informant.addressSameAs',
      type: FieldType.RADIO_GROUP,
      options: yesNoRadioOptions,
      required: true,
      label: {
        defaultMessage: "Same as deceased's usual place of residence?",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.address.addressSameAs.label'
      },
      defaultValue: YesNoTypes.YES,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: informantOtherThanSpouse
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('informant.addressSameAs').isEqualTo(
            YesNoTypes.YES
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.addressDivider1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            informantOtherThanSpouse,
            field('informant.addressSameAs').isEqualTo(YesNoTypes.NO)
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.addressHelper.label'
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
            informantOtherThanSpouse,
            field('informant.addressSameAs').isEqualTo(YesNoTypes.NO)
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.address',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            informantOtherThanSpouse,
            field('informant.addressSameAs').isEqualTo(YesNoTypes.NO)
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
          validator: field('informant.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'informant.address',
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
      },
      parent: field('informant.relation')
    },
    {
      id: 'informant.addressDivider2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: informantOtherThanSpouse
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.phoneNo',
      type: FieldType.PHONE,
      required: false,
      secured: true,
      label: {
        defaultMessage: 'Phone number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.phoneNo.label'
      },
      validation: [
        {
          message: {
            defaultMessage:
              'Must be a valid 10 digit number that starts with 0(7|9)',
            description:
              'The error message that appears on phone numbers where the first two characters must be 07 or 09, and length must be 10',
            id: 'event.death.action.declare.form.section.informant.field.phoneNo.error'
          },
          validator: or(
            field('informant.phoneNo').matches(PHONE_NUMBER_REGEX),
            field('informant.phoneNo').isFalsy()
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.email',
      type: FieldType.EMAIL,
      required: true,
      secured: true,
      label: {
        defaultMessage: 'Email',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.email.label'
      },
      configuration: {
        maxLength: 255
      },
      parent: field('informant.relation')
    }
  ]
})
