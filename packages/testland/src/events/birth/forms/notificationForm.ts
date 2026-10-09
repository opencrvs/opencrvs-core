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

import { defineDeclarationForm, FieldType } from '@opencrvs/toolkit/events'
import { securePageWhileSealed } from '@countryconfig/events/utils'
import { child } from './pages/child'
import { BIRTH_DECLARATION_REVIEW } from './declaration'

/**
 * Child fields captured on a birth notification. The fields are taken from the
 * declaration form, so their values pre-fill the declaration.
 */
const NOTIFICATION_CHILD_FIELD_IDS = [
  'child.name',
  'child.gender',
  'child.dob',
  'child.placeOfBirth',
  'child.birthLocation',
  'child.birthLocation.privateHome',
  'child.birthLocation.other'
]

export const BIRTH_NOTIFICATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Birth notification form',
    id: 'event.birth.action.notify.form.label',
    description: 'This is what the birth notification form is referred as'
  },
  pages: [
    securePageWhileSealed({
      ...child,
      fields: child.fields.filter(({ id }) =>
        NOTIFICATION_CHILD_FIELD_IDS.includes(id)
      )
    })
  ]
})

/**
 * The declaration review fields are kept (optional) so that values entered on the
 * review page during notify carry over to the declaration.
 * `notifier.signature` is notify-only data, stored only in the NOTIFY action annotation.
 */
export const BIRTH_NOTIFICATION_REVIEW = {
  title: BIRTH_DECLARATION_REVIEW.title,
  fields: [
    ...BIRTH_DECLARATION_REVIEW.fields.map((field) => ({
      ...field,
      required: false
    })),
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
