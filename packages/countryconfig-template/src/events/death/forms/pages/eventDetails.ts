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
  field,
  FieldType,
  never,
  not,
  or,
  PageTypes,
  TranslationConfig,
  user
} from '@opencrvs/toolkit/events'

import {
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  DEATH_REGISTRATION_TARGET_DAYS,
  createSelectOptions,
  emptyMessage
} from '@countryconfig/events/utils'

const MannerDeathType = {
  MANNER_NATURAL: 'MANNER_NATURAL',
  MANNER_ACCIDENT: 'MANNER_ACCIDENT',
  MANNER_SUICIDE: 'MANNER_SUICIDE',
  MANNER_HOMICIDE: 'MANNER_HOMICIDE',
  MANNER_UNDETERMINED: 'MANNER_UNDETERMINED'
} as const

const mannerDeathMessageDescriptors = {
  MANNER_NATURAL: {
    defaultMessage: 'Natural causes',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathNatural'
  },
  MANNER_ACCIDENT: {
    defaultMessage: 'Accident',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathAccident'
  },
  MANNER_SUICIDE: {
    defaultMessage: 'Suicide',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathSuicide'
  },
  MANNER_HOMICIDE: {
    defaultMessage: 'Homicide',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathHomicide'
  },
  MANNER_UNDETERMINED: {
    defaultMessage: 'Manner undetermined',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathUndetermined'
  }
} satisfies Record<keyof typeof MannerDeathType, TranslationConfig>

const mannerDeathTypeOptions = createSelectOptions(
  MannerDeathType,
  mannerDeathMessageDescriptors
)

const SourceCauseDeathType = {
  PHYSICIAN: 'PHYSICIAN',
  LAY_REPORTED: 'LAY_REPORTED',
  VERBAL_AUTOPSY: 'VERBAL_AUTOPSY',
  MEDICALLY_CERTIFIED: 'MEDICALLY_CERTIFIED'
} as const

const sourceCauseDeathMessageDescriptors = {
  PHYSICIAN: {
    defaultMessage: 'Physician',
    description: 'Label for form field: physician',
    id: 'form.field.label.physician'
  },
  LAY_REPORTED: {
    defaultMessage: 'Lay reported',
    description: 'Label for form field: Lay reported',
    id: 'form.field.label.layReported'
  },
  VERBAL_AUTOPSY: {
    defaultMessage: 'Verbal autopsy',
    description: 'Option for form field: verbalAutopsy',
    id: 'form.field.label.verbalAutopsy'
  },
  MEDICALLY_CERTIFIED: {
    defaultMessage: 'Medically Certified Cause of Death',
    description: 'Option for form field: Method of Cause of Death',
    id: 'form.field.label.medicallyCertified'
  }
} satisfies Record<keyof typeof SourceCauseDeathType, TranslationConfig>

const sourceCauseDeathOptions = createSelectOptions(
  SourceCauseDeathType,
  sourceCauseDeathMessageDescriptors
)

export const PlaceOfDeath = {
  HEALTH_FACILITY: 'HEALTH_FACILITY',
  DECEASED_USUAL_RESIDENCE: 'DECEASED_USUAL_RESIDENCE',
  OTHER: 'OTHER'
} as const

const placeOfDeathMessageDescriptors = {
  HEALTH_FACILITY: {
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution',
    id: 'form.field.label.healthInstitution'
  },
  DECEASED_USUAL_RESIDENCE: {
    defaultMessage: "Deceased's usual place of residence",
    description:
      'Option for place of occurrence of death same as deceased primary address',
    id: 'form.field.label.placeOfDeathSameAsPrimary'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Select item for Other location',
    id: 'form.field.label.otherInstitution'
  }
} satisfies Record<keyof typeof PlaceOfDeath, TranslationConfig>

const placeOfDeathOptions = createSelectOptions(
  PlaceOfDeath,
  placeOfDeathMessageDescriptors
)

export const eventDetails = defineFormPage({
  id: 'eventDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Event details',
    description: 'Form section title for event details',
    id: 'form.death.eventDetails.title'
  },
  fields: [
    {
      id: 'eventDetails.date',
      type: FieldType.DATE,
      required: true,
      secured: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date',
            description: 'This is the error message for invalid date',
            id: 'event.death.action.declare.form.section.event.field.date.error'
          },
          validator: field('eventDetails.date').isBefore().now()
        },
        {
          message: {
            defaultMessage:
              "Date of death must be after the deceased's birth date",
            description:
              'This is the error message for date of death before date of birth',
            id: 'event.death.action.declare.form.section.event.field.date.error.beforeBirth'
          },
          validator: or(
            field('eventDetails.date').isAfter().date(field('deceased.dob')),
            field('deceased.dobUnknown').isEqualTo(true)
          )
        }
      ],
      label: {
        defaultMessage: 'Date of death',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.date.label'
      }
    },
    {
      id: 'eventDetails.reasonForLateRegistration',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason for late registration',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(
              field('eventDetails.date')
                .isAfter()
                .days(DEATH_REGISTRATION_TARGET_DAYS)
                .inPast()
            ),
            field('eventDetails.date').isBefore().now()
          )
        }
      ]
    },
    {
      id: 'eventDetails.mannerOfDeath',
      type: FieldType.SELECT,
      required: false,
      label: {
        defaultMessage: 'Manner of death',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.manner.label'
      },
      options: mannerDeathTypeOptions
    },
    {
      id: 'eventDetails.causeOfDeathEstablished',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Cause of death has been established',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.causeOfDeath.label'
      }
    },
    {
      id: 'eventDetails.sourceCauseDeath',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Source of cause of death',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.sourceCauseDeath.label'
      },
      options: sourceCauseDeathOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.causeOfDeathEstablished').isEqualTo(
            true
          )
        }
      ]
    },
    {
      id: 'eventDetails.description',
      type: FieldType.TEXTAREA,
      required: true,
      label: {
        defaultMessage: 'Description',
        description:
          'Description of cause of death by lay person or verbal autopsy',
        id: 'event.death.action.declare.form.section.event.field.description.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            or(
              field('eventDetails.sourceCauseDeath').isEqualTo(
                SourceCauseDeathType.LAY_REPORTED
              ),
              field('eventDetails.sourceCauseDeath').isEqualTo(
                SourceCauseDeathType.VERBAL_AUTOPSY
              )
            ),
            field('eventDetails.causeOfDeathEstablished').isEqualTo(true)
          )
        }
      ]
    },
    {
      id: 'eventDetails.divider1',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'eventDetails.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Place of death',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.addressHelper.label'
      },
      configuration: {
        styles: { fontVariant: 'h3' }
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'eventDetails.divider2',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'eventDetails.placeOfDeath',
      type: FieldType.SELECT,
      required: true,
      secured: true,
      label: {
        defaultMessage: 'Place of death',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.placeOfDeath.label'
      },
      options: placeOfDeathOptions
    },
    {
      id: 'eventDetails.deathLocation',
      type: FieldType.LOCATION,
      required: true,
      secured: true,
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.deathLocation.label'
      },
      parent: field('eventDetails.placeOfDeath'),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.placeOfDeath').isEqualTo(
            PlaceOfDeath.HEALTH_FACILITY
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
      id: 'eventDetails.deathLocationOther',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      secured: true,
      label: {
        defaultMessage: 'Death location address',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.deathLocationOther.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.placeOfDeath').isEqualTo(
            PlaceOfDeath.OTHER
          )
        }
      ],
      parent: field('eventDetails.placeOfDeath'),
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field(
            'eventDetails.deathLocationOther'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'eventDetails.deathLocationOther',
          defaultStreetAddressConfiguration
        )
      ],
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration,
        allowedLocations: user.jurisdiction(
          user.scope('record.create').attribute('placeOfEvent')
        )
      }
    },
    {
      id: 'eventDetails.deathLocationId',
      type: FieldType.ALPHA_HIDDEN,
      required: false,
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthLocation.label'
      },
      parent: [
        field('eventDetails.placeOfDeath'),
        field('eventDetails.deathLocation'),
        field('eventDetails.deathLocationOther'),
        field('deceased.address')
      ],
      value: [
        field('eventDetails.deathLocation'),
        field('eventDetails.deathLocationOther').get('administrativeArea'),
        field('deceased.address').get('administrativeArea')
      ]
    }
  ]
})
