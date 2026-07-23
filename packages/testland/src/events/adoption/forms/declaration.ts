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
import { introduction } from './pages/introduction'
import { child } from './pages/child'
import { adoptionOrder } from './pages/adoptionOrder'
import { createAdoptiveParentPage } from './pages/adoptiveParent'
import { documents } from './pages/documents'

const adoptiveMother = createAdoptiveParentPage(
  'adoptiveMother',
  {
    defaultMessage: 'Adoptive parent 1 details',
    description: 'Form section title for adoptive parent 1 details',
    id: 'form.adoption.adoptiveMother.title'
  },
  true
)

const adoptiveFather = createAdoptiveParentPage(
  'adoptiveFather',
  {
    defaultMessage: 'Adoptive parent 2 details',
    description: 'Form section title for adoptive parent 2 details',
    id: 'form.adoption.adoptiveFather.title'
  },
  false
)

export const ADOPTION_DECLARATION_REVIEW = {
  title: {
    id: 'event.adoption.action.declare.form.review.title',
    defaultMessage:
      '{child.name.firstname, select, __EMPTY__ {Adoption declaration} other {{child.name.surname, select, __EMPTY__ {Adoption declaration for {child.name.firstname}} other {Adoption declaration for {child.name.firstname} {child.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      id: 'review.comment',
      type: FieldType.TEXTAREA,
      label: {
        defaultMessage: 'Comment',
        id: 'event.adoption.action.declare.form.review.comment.label',
        description: 'Label for the comment field in the review section'
      }
    },
    {
      type: FieldType.SIGNATURE,
      id: 'review.signature',
      required: true,
      label: {
        defaultMessage: 'Signature of applicant',
        id: 'event.adoption.action.declare.form.review.signature.label',
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

export const ADOPTION_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Adoption declaration form',
    id: 'event.adoption.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    introduction,
    child,
    adoptionOrder,
    adoptiveMother,
    adoptiveFather,
    documents
  ]
})
