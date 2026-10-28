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
  defineDeclarationForm,
  FieldType,
  field,
  defineFormPage,
  FieldConfigInput,
  PageTypes,
  or
} from '@opencrvs/toolkit/events'
import { BIRTH_LATE_REGISTRATION_TARGET_DAYS } from '@countryconfig/events/utils'
import {
  child,
  typeOfBirthOptions,
  attendantAtBirthOptions
} from './pages/child'
import {
  farajalandNameConfig,
  invalidNameValidator,
  MAX_NAME_LENGTH
} from '../validators'
import { PHONE_NUMBER_REGEX } from './pages/informant'
import { mother } from './pages/mother'

/**
 * Child fields captured on a birth notification. The fields are taken from the
 * declaration form, so their values pre-fill the declaration.
 */
const NOTIFICATION_CHILD_FIELD_IDS = [
  'child.gender',
  'child.placeOfBirth',
  'child.birthLocation',
  'child.birthLocation.privateHome',
  'child.birthLocation.other',
  'child.weightAtBirth',
  'child.birthLocationId'
]

// Fields directly picked from the declaration form.
const pickedFields = child.fields.filter(({ id }) =>
  NOTIFICATION_CHILD_FIELD_IDS.includes(id)
)

// Fields which are different on the notification form.
const differentFields: FieldConfigInput[] = [
  {
    id: 'child.name',
    type: FieldType.NAME,
    required: true,
    configuration: {
      name: {
        firstname: { required: false },
        surname: { required: true }
      },
      maxLength: MAX_NAME_LENGTH
    },
    hideLabel: true,
    label: {
      defaultMessage: "Child's name",
      description: 'This is the label for the field',
      id: 'event.birth.action.declare.form.section.child.field.name.label'
    },
    validation: [invalidNameValidator('child.name')]
  },
  // For notification, dont allow late registration.
  {
    id: 'child.dob',
    analytics: true,
    type: FieldType.DATE,
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
      },
      {
        message: {
          defaultMessage: 'Late registration is not allowed',
          description: 'This is the error message for late registration',
          id: 'event.birth.action.notify.form.section.child.field.dob.error'
        },
        validator: field('child.dob')
          .isAfter()
          .days(BIRTH_LATE_REGISTRATION_TARGET_DAYS)
          .inPast()
      }
    ],
    label: {
      defaultMessage: 'Date of birth',
      description: 'This is the label for the field',
      id: 'event.birth.action.declare.form.section.child.field.dob.label'
    }
  },
  // This field is required on the notification form, but optional on the declaration form.
  {
    id: 'child.birthType',
    analytics: true,
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Type of birth',
      description: 'This is the label for the field',
      id: 'event.birth.action.declare.form.section.child.field.birthType.label'
    },
    options: typeOfBirthOptions
  },
  // This field is required on the notification form, but optional on the declaration form.
  {
    id: 'child.attendantAtBirth',
    type: FieldType.SELECT,
    analytics: true,
    required: true,
    label: {
      defaultMessage: 'Attendant at birth',
      description: 'This is the label for the field',
      id: 'event.birth.action.declare.form.section.child.field.attendantAtBirth.label'
    },
    options: attendantAtBirthOptions
  }
]

/**
 * Mother's ID fields are picked from the declaration form. `requireMotherDetails`
 * in their conditionals is always true here, as the notification form has
 * neither the informant's relation nor the "details not available" checkbox.
 *
 * The ID type is optional on a notification, so notifications without the
 * mother's ID stay valid. Once a type is chosen, its ID number is required.
 */
const motherIdFields = mother.fields
  .filter(({ id }) =>
    ['mother.idType', 'mother.nid', 'mother.passport', 'mother.brn'].includes(
      id
    )
  )
  .map((f) => (f.id === 'mother.idType' ? { ...f, required: false } : f))

const childPage = defineFormPage({
  id: 'child',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Child's details",
    description: 'Form section title for Child',
    id: 'form.birth.child.title'
  },
  fields: [...differentFields, ...pickedFields]
})

const mothersPage = defineFormPage({
  id: 'mother',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Mother's details",
    description: 'Form section title for mothers details',
    id: 'form.section.mother.title'
  },
  fields: [
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
      }
    },
    ...motherIdFields,
    {
      id: 'informant.phoneNo',
      type: FieldType.PHONE,
      required: false,
      secured: true,
      label: {
        defaultMessage: 'Phone number',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.informant.field.phoneNo.label'
      },
      validation: [
        {
          message: {
            defaultMessage:
              'Must be a valid 10 digit number that starts with 0(7|9)',
            description:
              'The error message that appears on phone numbers where the first two characters must be 07 or 09, and length must be 10',
            id: 'event.birth.action.declare.form.section.informant.field.phoneNo.error'
          },
          validator: or(
            field('informant.phoneNo').matches(PHONE_NUMBER_REGEX),
            field('informant.phoneNo').isFalsy()
          )
        }
      ]
    },
    {
      id: 'informant.email',
      type: FieldType.EMAIL,
      required: true,
      secured: true,
      label: {
        defaultMessage: 'Email',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.informant.field.email.label'
      },
      configuration: {
        maxLength: 255
      }
    }
  ]
})

export const BIRTH_NOTIFICATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Birth notification form',
    id: 'event.birth.action.notify.form.label',
    description: 'This is what the birth notification form is referred as'
  },
  pages: [childPage, mothersPage]
})
