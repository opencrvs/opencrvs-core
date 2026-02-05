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
import { defineConfig } from '../events/defineConfig'
import { ActionType } from '../events/ActionType'
import { PageTypes } from '../events/PageConfig'
import { FieldType } from '../events/FieldType'
import { event } from '../events/event'
import {
  defineActionForm,
  defineDeclarationForm
} from '../events/EventConfigInput'
import { user, and, never, not } from '../conditionals/conditionals'
import { ConditionalType } from '../events/Conditional'

/**
 * @knipignore
 */
export const PRINT_DIGITAL_ID_CERTIFICATE_FORM = defineActionForm({
  label: {
    id: 'event.digital-identity.action.certificate.form.label',
    defaultMessage: 'Digital identity certificate printer',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'collector',
      type: PageTypes.enum.FORM,
      title: {
        id: 'event.tennis-club-membership.action.certificate.form.section.who.title',
        defaultMessage: 'Print certified copy',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'identity.http-fetch',
          type: FieldType.HTTP,
          label: {
            defaultMessage: 'Digital identity certificate',
            description: 'Fetch printable digital identity certificate',
            id: 'event.digital-identity.certificate.fetch.label'
          },
          configuration: {
            trigger: event.declaration('identity.http-button'),
            url: '/api/digital-identity/certificate',
            timeout: 5000,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: {
              subjectId: '$event.subject.id'
            }
          }
        },
        {
          id: 'identity.http-button',
          type: FieldType.BUTTON,
          label: {
            defaultMessage: 'Certificate',
            description: 'Certificate',
            id: 'event.digital-identity.certificate.button.label'
          },
          conditionals: [
            {
              type: ConditionalType.ENABLE,
              conditional: and(
                event.declaration('identity.http-fetch').isUndefined(),
                user.isOnline()
              )
            },
            {
              type: ConditionalType.SHOW,
              conditional: and(
                event
                  .declaration('identity.http-fetch')
                  .get('loading')
                  .isFalsy(),
                event.declaration('identity.http-fetch').get('data').isFalsy()
              )
            }
          ],
          configuration: {
            icon: 'IdentificationCard',
            text: {
              defaultMessage: 'Fetch certificate',
              description: 'Fetch certificate',
              id: 'event.digital-identity.certificate.fetch.text'
            }
          }
        },
        {
          id: 'identity.http-button',
          type: FieldType.BUTTON,
          label: {
            defaultMessage: 'Certificate',
            description: 'Certificate',
            id: 'event.digital-identity.certificate.button.label'
          },
          conditionals: [
            {
              type: ConditionalType.ENABLE,
              conditional: never()
            },
            {
              type: ConditionalType.SHOW,
              conditional: event
                .declaration('identity.http-fetch')
                .get('loading')
                .isEqualTo(true)
            }
          ],
          configuration: {
            loading: true,
            text: {
              defaultMessage: 'Fetching certificate…',
              description: 'Fetching certificate…',
              id: 'event.digital-identity.certificate.fetching.text'
            }
          }
        },
        {
          id: 'identity.http-button',
          type: FieldType.BUTTON,
          label: {
            defaultMessage: 'Certificate',
            description: 'Certificate',
            id: 'event.digital-identity.certificate.button.label'
          },
          conditionals: [
            {
              type: ConditionalType.ENABLE,
              conditional: never()
            },
            {
              type: ConditionalType.SHOW,
              conditional: not(
                event.declaration('identity.certificateId').isFalsy()
              )
            }
          ],
          configuration: {
            icon: 'Check',
            text: {
              defaultMessage: 'Certificate ready',
              description: 'Certificate ready',
              id: 'event.digital-identity.certificate.ready.text'
            }
          }
        },
        {
          id: 'identity.certificateId',
          type: FieldType.TEXT,
          parent: event.declaration('identity.http-fetch'),
          label: {
            defaultMessage: 'Certificate ID',
            description: 'Issued digital identity certificate identifier',
            id: 'event.digital-identity.certificate.id.label'
          },
          conditionals: [
            {
              type: ConditionalType.ENABLE,
              conditional: never()
            }
          ],
          value: event
            .declaration('identity.http-fetch')
            .get('data.certificateId')
        }
      ]
    }
  ]
})

const digitalIdentityForm = defineDeclarationForm({
  label: {
    id: 'event.digital-identity.action.declare.form.label',
    defaultMessage: 'Digital identity issuance',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'subject',
      title: {
        id: 'event.digital-identity.action.declare.form.section.who.title',
        defaultMessage: 'Who is the digital identity issued to?',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'subject.firstname',
          type: FieldType.TEXT,
          required: true,
          conditionals: [],
          label: {
            defaultMessage: "Subject's first name",
            description: 'This is the label for the field',
            id: 'event.digital-identity.action.declare.form.section.who.field.firstname.label'
          }
        },
        {
          id: 'subject.surname',
          type: FieldType.TEXT,
          required: true,
          conditionals: [],
          label: {
            defaultMessage: "Subject's surname",
            description: 'This is the label for the field',
            id: 'event.digital-identity.action.declare.form.section.who.field.surname.label'
          }
        }
      ]
    }
  ]
})

/**
 * @knipignore
 */
export const digitalIdentityEvent = defineConfig({
  id: 'digital-identity',
  label: {
    defaultMessage: 'Digital identity issuance',
    description: 'This is what this event is referred as in the system',
    id: 'event.digital-identity.label'
  },
  title: {
    defaultMessage: '{subject.firstname} {subject.surname}',
    description: 'This is the title of the summary',
    id: 'event.digital-identity.title'
  },
  summary: { fields: [] },
  actions: [
    {
      type: ActionType.PRINT_CERTIFICATE,
      label: {
        id: 'event.football-club-membership.action.collect-certificate.label',
        defaultMessage: 'Print certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from'
      },
      printForm: PRINT_DIGITAL_ID_CERTIFICATE_FORM
    }
  ],
  declaration: digitalIdentityForm
})
