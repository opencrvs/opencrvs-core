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
  defineFormPage,
  TranslationConfig,
  ConditionalType,
  and,
  FieldType,
  AddressType,
  or,
  PageTypes,
  field,
  user,
  never,
  SelectOption
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

import {
  createSelectOptions,
  emptyMessage,
  BIRTH_LATE_REGISTRATION_TARGET_DAYS,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators
} from '@countryconfig/events/utils'
import {
  farajalandNameConfig,
  invalidNameValidator
} from '@countryconfig/events/birth/validators'

const GenderTypes = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown'
} as const

const TypeOfBirth = {
  SINGLE: 'SINGLE',
  TWIN: 'TWIN',
  TRIPLET: 'TRIPLET',
  QUADRUPLET: 'QUADRUPLET',
  HIGHER_MULTIPLE_DELIVERY: 'HIGHER_MULTIPLE_DELIVERY'
} as const

const AttendantAtBirth = {
  PHYSICIAN: 'PHYSICIAN',
  NURSE: 'NURSE',
  MIDWIFE: 'MIDWIFE',
  OTHER_PARAMEDICAL_PERSONNEL: 'OTHER_PARAMEDICAL_PERSONNEL',
  LAYPERSON: 'LAYPERSON',
  TRADITIONAL_BIRTH_ATTENDANT: 'TRADITIONAL_BIRTH_ATTENDANT',
  NONE: 'NONE'
} as const

export const PlaceOfBirth = {
  HEALTH_FACILITY: 'HEALTH_FACILITY',
  PRIVATE_HOME: 'PRIVATE_HOME',
  OTHER: 'OTHER'
} as const

const genderMessageDescriptors = {
  MALE: {
    defaultMessage: 'Male',
    description: 'Label for option male',
    id: 'form.field.label.sexMale'
  },
  FEMALE: {
    defaultMessage: 'Female',
    description: 'Label for option female',
    id: 'form.field.label.sexFemale'
  },
  UNKNOWN: {
    defaultMessage: 'Unknown',
    description: 'Label for option unknown',
    id: 'form.field.label.sexUnknown'
  }
} satisfies Record<keyof typeof GenderTypes, TranslationConfig>

const typeOfBirthMessageDescriptors = {
  SINGLE: {
    defaultMessage: 'Single',
    description: 'Label for single birth',
    id: 'form.field.label.birthTypeSingle'
  },
  TWIN: {
    defaultMessage: 'Twin',
    description: 'Label for twin birth',
    id: 'form.field.label.birthTypeTwin'
  },
  TRIPLET: {
    defaultMessage: 'Triplet',
    description: 'Label for triplet birth',
    id: 'form.field.label.birthTypeTriplet'
  },
  QUADRUPLET: {
    defaultMessage: 'Quadruplet',
    description: 'Label for quadruplet birth',
    id: 'form.field.label.birthTypeQuadruplet'
  },
  HIGHER_MULTIPLE_DELIVERY: {
    defaultMessage: 'Higher multiple delivery',
    description: 'Label for higher multiple delivery birth',
    id: 'form.field.label.birthTypeHigherMultipleDelivery'
  }
} satisfies Record<keyof typeof TypeOfBirth, TranslationConfig>

const attendantAtBirthMessageDescriptors = {
  PHYSICIAN: {
    defaultMessage: 'Physician',
    description: 'Label for physician attendant',
    id: 'form.field.label.attendantAtBirthPhysician'
  },
  NURSE: {
    defaultMessage: 'Nurse',
    description: 'Label for nurse attendant',
    id: 'form.field.label.attendantAtBirthNurse'
  },
  MIDWIFE: {
    defaultMessage: 'Midwife',
    description: 'Label for midwife attendant',
    id: 'form.field.label.attendantAtBirthMidwife'
  },
  OTHER_PARAMEDICAL_PERSONNEL: {
    defaultMessage: 'Other paramedical personnel',
    description: 'Label for other paramedical personnel',
    id: 'form.field.label.attendantAtBirthOtherParamedicalPersonnel'
  },
  LAYPERSON: {
    defaultMessage: 'Layperson',
    description: 'Label for layperson attendant',
    id: 'form.field.label.attendantAtBirthLayperson'
  },
  TRADITIONAL_BIRTH_ATTENDANT: {
    defaultMessage: 'Traditional birth attendant',
    description: 'Label for traditional birth attendant',
    id: 'form.field.label.attendantAtBirthTraditionalBirthAttendant'
  },
  NONE: {
    defaultMessage: 'None',
    description: 'Label for no attendant',
    id: 'form.field.label.attendantAtBirthNone'
  }
} satisfies Record<keyof typeof AttendantAtBirth, TranslationConfig>

export const placeOfBirthMessageDescriptors = {
  HEALTH_FACILITY: {
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution',
    id: 'form.field.label.healthInstitution'
  },
  PRIVATE_HOME: {
    defaultMessage: 'Residential address',
    description: 'Select item for Private Home',
    id: 'form.field.label.privateHome'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Select item for Other location',
    id: 'form.field.label.otherInstitution'
  }
} satisfies Record<keyof typeof PlaceOfBirth, TranslationConfig>

const genderOptions = createSelectOptions(GenderTypes, genderMessageDescriptors)

const placeOfBirthOptions = [
  {
    value: PlaceOfBirth.HEALTH_FACILITY,
    label: placeOfBirthMessageDescriptors.HEALTH_FACILITY,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          not(user.hasRole('EMBASSY_OFFICIAL')),
          not(user.hasRole('COMMUNITY_LEADER'))
        )
      }
    ]
  },
  {
    value: PlaceOfBirth.PRIVATE_HOME,
    label: placeOfBirthMessageDescriptors.PRIVATE_HOME,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: not(user.hasRole('HOSPITAL_CLERK'))
      }
    ]
  },
  {
    value: PlaceOfBirth.OTHER,
    label: placeOfBirthMessageDescriptors.OTHER.defaultMessage,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: not(user.hasRole('HOSPITAL_CLERK'))
      }
    ]
  }
] satisfies SelectOption[]

const typeOfBirthOptions = createSelectOptions(
  TypeOfBirth,
  typeOfBirthMessageDescriptors
)

const attendantAtBirthOptions = createSelectOptions(
  AttendantAtBirth,
  attendantAtBirthMessageDescriptors
)

export const child = defineFormPage({
  id: 'child',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Child's details",
    description: 'Form section title for Child',
    id: 'form.birth.child.title'
  },
  fields: [
    {
      id: 'child.nid',
      type: FieldType.TEXT,
      label: {
        defaultMessage: 'National ID',
        description: 'Label for national ID field for child',
        id: 'event.birth.action.declare.form.section.child.field.nid.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: never()
        }
      ]
    },
    {
      id: 'child.name',
      type: FieldType.NAME,
      required: true,
      configuration: farajalandNameConfig,
      hideLabel: true,
      label: {
        defaultMessage: "Child's name",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.name.label'
      },
      validation: [invalidNameValidator('child.name')]
    },
    {
      id: 'child.gender',
      analytics: true,
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Sex',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.gender.label'
      },
      options: genderOptions
    },
    {
      id: 'child.dob',
      analytics: true,
      type: 'DATE',
      required: true,
      secured: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'event.birth.action.declare.form.section.child.field.dob.error'
          },
          validator: field('child.dob').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.dob.label'
      }
    },
    {
      id: 'child.reason',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason for delayed registration',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(
              field('child.dob')
                .isAfter()
                .days(BIRTH_LATE_REGISTRATION_TARGET_DAYS)
                .inPast()
            ),
            field('child.dob').isBefore().now()
          )
        }
      ]
    },
    {
      id: 'child.divider1',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'child.placeOfBirth',
      analytics: true,
      type: FieldType.SELECT,
      required: true,
      secured: true,
      label: {
        defaultMessage: 'Place of delivery',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.placeOfBirth.label'
      },
      options: placeOfBirthOptions
    },
    {
      id: 'child.birthLocation',
      analytics: true,
      type: FieldType.LOCATION,
      required: true,
      secured: true,
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthLocation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.placeOfBirth').isEqualTo(
            PlaceOfBirth.HEALTH_FACILITY
          )
        }
      ],
      configuration: {
        locationTypes: ['HEALTH_FACILITY'],
        allowedLocations: user.jurisdiction(
          user.scope('record.create').attribute('placeOfEvent')
        )
      }
    },
    {
      id: 'child.birthLocation.privateHome',
      analytics: true,
      type: FieldType.ADDRESS,
      required: true,
      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Child`s address',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthLocation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.placeOfBirth').isEqualTo(
            PlaceOfBirth.PRIVATE_HOME
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
          validator: field(
            'child.birthLocation.privateHome'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'child.birthLocation.privateHome',
          defaultStreetAddressConfiguration
        )
      ],
      parent: field('child.placeOfBirth'),
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('administrativeAreaId')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration,
        allowedLocations: user.jurisdiction(
          user.scope('record.create').attribute('placeOfEvent')
        )
      }
    },
    {
      id: 'child.birthLocation.other',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,

      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Child`s address',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthLocation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.placeOfBirth').isEqualTo(PlaceOfBirth.OTHER)
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field(
            'child.birthLocation.other'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'child.birthLocation.other',
          defaultStreetAddressConfiguration
        )
      ],
      parent: field('child.placeOfBirth'),
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('administrativeAreaId')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration,
        allowedLocations: user.jurisdiction(
          user.scope('record.create').attribute('placeOfEvent')
        )
      }
    },
    {
      id: 'child.birthLocationId',
      type: FieldType.ALPHA_HIDDEN,
      required: false,
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthLocation.label'
      },
      parent: [
        field('child.placeOfBirth'),
        field('child.birthLocation'),
        field('child.birthLocation.privateHome'),
        field('child.birthLocation.other')
      ],
      value: [
        field('child.birthLocation'),
        field('child.birthLocation.privateHome').get('administrativeArea'),
        field('child.birthLocation.other').get('administrativeArea')
      ]
    },
    {
      id: 'child.divider2',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'child.attendantAtBirth',
      type: FieldType.SELECT,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Attendant at birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.attendantAtBirth.label'
      },
      options: attendantAtBirthOptions
    },
    {
      id: 'child.birthType',
      analytics: true,
      type: FieldType.SELECT,
      required: false,
      label: {
        defaultMessage: 'Type of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthType.label'
      },
      options: typeOfBirthOptions
    },
    {
      id: 'child.weightAtBirth',
      analytics: true,
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'Weight at birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.weightAtBirth.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be within 0 and 6',
            description: 'This is the error message for invalid number range',
            id: 'error.child.weightAtBirth.invalidNumberRange'
          },
          validator: or(
            field('child.weightAtBirth').isBetween(0, 6),
            field('child.weightAtBirth').isUndefined()
          )
        }
      ],
      configuration: {
        min: 0,
        postfix: {
          defaultMessage: 'Kilograms (kg)',
          description: 'This is the postfix for the weight field',
          id: 'event.birth.action.declare.form.section.child.field.weightAtBirth.postfix'
        }
      }
    }
  ]
})
