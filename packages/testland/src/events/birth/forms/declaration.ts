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
  ActionType,
  and,
  ConditionalType,
  defineDeclarationForm,
  event,
  FieldType,
  not,
  or,
  user
} from '@opencrvs/toolkit/events'
import { securePageWhileSealed } from '@countryconfig/events/utils'
import { childPage } from './pages/child'
import { informantPage } from './pages/informant'
import { introductionPage } from './pages/introduction'
import { motherPage } from './pages/mother'
import { fatherPage } from './pages/father'
import { documents } from './pages/documents'
import { BirthVersion } from '../versions'

/** The review page of the birth declaration. Only version `v2` asks for the signature of the informant. */
export function birthDeclarationReview(version: BirthVersion) {
  return {
    title: {
      id: 'event.birth.action.declare.form.review.title',
      defaultMessage:
        '{child.name.firstname, select, __EMPTY__ {Birth declaration} other {{child.name.surname, select, __EMPTY__ {Birth declaration for {child.name.firstname}} other {Birth declaration for {child.name.firstname} {child.name.surname}}}}}',
      description: 'Title of the form to show in review page'
    },
    fields: [
      {
        id: 'review.print',
        type: FieldType.ALPHA_PRINT_BUTTON,
        label: {
          defaultMessage: 'Print certificate in advance of registration',
          id: 'event.birth.action.declare.form.review.print.label',
          description: 'Label for the print button in the review section'
        },
        configuration: {
          template: 'v2.birth-certified-certificate',
          buttonLabel: {
            defaultMessage: 'Print certificate in advance of registration',
            description: "Print button's label",
            id: 'event.birth.action.declare.form.review.print.label'
          }
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              or(
                user.hasRole('LOCAL_REGISTRAR'),
                user.hasRole('PROVINCIAL_REGISTRAR'),
                user.hasRole('NATIONAL_REGISTRAR')
              ),
              not(event.hasAction(ActionType.DECLARE)),
              not(event.hasAction(ActionType.NOTIFY))
            )
          }
        ]
      },
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
      ...(version === BirthVersion.V2
        ? [
            {
              type: FieldType.SIGNATURE,
              id: 'review.signature',
              required: true,
              label: {
                defaultMessage: 'Signature of informant',
                id: 'event.birth.action.declare.form.review.signature.label',
                description:
                  'Label for the signature field in the review section'
              },
              signaturePromptLabel: {
                id: 'signature.upload.modal.title',
                defaultMessage: 'Draw signature',
                description: 'Title for the modal to draw signature'
              }
            }
          ]
        : [])
    ]
  }
}

export function birthDeclarationForm(version: BirthVersion) {
  return defineDeclarationForm({
    label: {
      defaultMessage: 'Birth decalration form',
      id: 'event.birth.action.declare.form.label',
      description: 'This is what this form is referred as in the system'
    },

    // A sealed birth record must not leak declaration data through the search
    // index - see securePageWhileSealed.
    pages: [
      introductionPage(version),
      childPage(version),
      informantPage(version),
      motherPage(version),
      fatherPage(version),
      documents
    ].map(securePageWhileSealed)
  })
}
