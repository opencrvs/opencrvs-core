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
  defineFormPage,
  FieldType,
  PageTypes
} from '@opencrvs/toolkit/events'
import { farajalandNameConfig } from '@countryconfig/events/birth/validators'

/**
 * Illustrative example of a NOTIFY-specific form, independent from
 * BIRTH_DECLARATION_FORM: a short form a health worker fills in to notify a
 * birth, collecting only what's needed at that point. `child.name` and
 * `child.gender` intentionally reuse the same field ids as
 * BIRTH_DECLARATION_FORM's child page, so a registrar completing the full
 * declaration later sees this data pre-filled.
 */
const notification = defineFormPage({
  id: 'notification',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Notify a birth',
    description: 'Form page title for the notify form',
    id: 'event.birth.action.notify.form.section.notification.title'
  },
  fields: [
    {
      id: 'child.name',
      type: FieldType.NAME,
      required: true,
      configuration: farajalandNameConfig,
      hideLabel: true,
      label: {
        defaultMessage: "Child's name",
        description: 'This is the label for the field',
        id: 'event.birth.action.notify.form.section.notification.field.name.label'
      }
    },
    {
      id: 'child.gender',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Sex',
        description: 'This is the label for the field',
        id: 'event.birth.action.notify.form.section.notification.field.gender.label'
      },
      options: [
        {
          value: 'male',
          label: {
            defaultMessage: 'Male',
            description: 'Label for option male',
            id: 'form.field.label.sexMale'
          }
        },
        {
          value: 'female',
          label: {
            defaultMessage: 'Female',
            description: 'Label for option female',
            id: 'form.field.label.sexFemale'
          }
        },
        {
          value: 'unknown',
          label: {
            defaultMessage: 'Unknown',
            description: 'Label for option unknown',
            id: 'form.field.label.sexUnknown'
          }
        }
      ]
    },
    {
      id: 'informant.phoneNo',
      type: FieldType.PHONE,
      required: false,
      label: {
        defaultMessage: "Notifier's phone number",
        description: 'This is the label for the field',
        id: 'event.birth.action.notify.form.section.notification.field.phoneNo.label'
      }
    }
  ]
})

export const BIRTH_NOTIFY_REVIEW = {
  title: {
    defaultMessage: 'Birth notification',
    id: 'event.birth.action.notify.form.review.title',
    description: 'Title of the notify form to show in review page'
  },
  fields: [
    {
      id: 'notify.comment',
      type: FieldType.TEXTAREA,
      label: {
        defaultMessage: 'Comment',
        id: 'event.birth.action.notify.form.review.comment.label',
        description: 'Label for the comment field in the review section'
      }
    }
  ]
}

export const BIRTH_NOTIFY_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Birth notification form',
    id: 'event.birth.action.notify.form.label',
    description: 'This is what this form is referred as in the system'
  },
  pages: [notification]
})
