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
  PageTypes
} from '@opencrvs/toolkit/events'
import {
  BIRTH_LATE_REGISTRATION_TARGET_DAYS,
  securePageWhileSealed
} from '@countryconfig/events/utils'
import {
  child,
  typeOfBirthOptions,
  attendantAtBirthOptions
} from './pages/child'

/**
 * Child fields captured on a birth notification. The fields are taken from the
 * declaration form, so their values pre-fill the declaration.
 */
const NOTIFICATION_CHILD_FIELD_IDS = [
  'child.name',
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

const childPage = defineFormPage({
  id: 'child',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Child's details",
    description: 'Form section title for Child',
    id: 'form.birth.child.title'
  },
  fields: [...pickedFields, ...differentFields]
})

export const BIRTH_NOTIFICATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Birth notification form',
    id: 'event.birth.action.notify.form.label',
    description: 'This is what the birth notification form is referred as'
  },
  pages: [securePageWhileSealed(childPage)]
})

export const BIRTH_NOTIFICATION_REVIEW = {
  title: {
    defaultMessage:
      '{child.name.firstname, select, __EMPTY__ {Birth notification} other {{child.name.surname, select, __EMPTY__ {Birth notification for {child.name.firstname}} other {Birth notificaton for {child.name.firstname} {child.name.surname}}}}}',
    id: 'event.birth.action.notify.form.review.title',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      id: 'review.comment',
      type: FieldType.TEXTAREA,
      label: {
        defaultMessage: 'Comment',
        id: 'event.birth.action.declare.form.review.comment.label',
        description: 'Label for the comment field in the review section'
      },
      required: true
    },
    {
      type: FieldType.SIGNATURE,
      id: 'notifier.signature',
      label: {
        defaultMessage: 'Signature of notifier',
        id: 'event.birth.action.notify.form.review.notifier.signature.label',
        description:
          'Label for the notifier signature field in the notify review section'
      },
      signaturePromptLabel: {
        id: 'signature.upload.modal.title',
        defaultMessage: 'Draw signature',
        description: 'Title for the modal to draw signature'
      }
    }
  ]
}
