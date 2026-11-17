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
import { deceased } from './pages/deceased'
import { informant } from './pages/informant'
import { deathIntroduction } from './pages/introduction'
import { documents } from './pages/documents'
import { spouse } from './pages/spouse'
import { eventDetails } from './pages/eventDetails'

export const DEATH_DECLARATION_REVIEW = {
  title: {
    id: 'event.death.action.declare.form.review.title',
    defaultMessage:
      '{deceased.name.firstname, select, __EMPTY__ {Death declaration} other {{deceased.name.surname, select, __EMPTY__ {Death declaration for {deceased.name.firstname}} other {Death declaration for {deceased.name.firstname} {deceased.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      id: 'review.comment',
      type: FieldType.TEXTAREA,
      label: {
        defaultMessage: 'Comment',
        id: 'event.death.action.declare.form.review.comment.label',
        description: 'Label for the comment field in the review section'
      },
      required: true
    },
    {
      type: FieldType.SIGNATURE,
      id: 'review.signature',
      required: true,
      label: {
        defaultMessage: 'Signature of informant',
        id: 'event.death.action.declare.form.review.signature.label',
        description: 'Label for the signature field in the review section'
      },
      signaturePromptLabel: {
        id: 'signature.upload.modal.title',
        defaultMessage: 'Draw signature',
        description: 'Title for the modal to draw signature'
      }
    }
  ]
}

export const DEATH_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Death declaration form',
    id: 'event.death.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [
    deathIntroduction,
    deceased,
    eventDetails,
    informant,
    spouse,
    documents
  ]
})
