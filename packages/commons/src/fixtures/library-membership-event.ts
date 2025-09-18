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
import { defineDeclarationForm } from '../events/EventConfigInput'
import { defineConfig } from '../events/defineConfig'
import { FieldType } from '../events/FieldType'

const libraryMembershipForm = defineDeclarationForm({
  label: {
    id: 'v2.event.library-membership.action.declare.form.label',
    defaultMessage: 'Library membership application',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'member',
      title: {
        id: 'v2.event.library-membership.action.declare.form.section.who.title',
        defaultMessage: 'Who is applying for the membership?',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'member.firstname',
          type: FieldType.TEXT,
          required: true,
          conditionals: [],
          label: {
            defaultMessage: "Member's first name",
            description: 'This is the label for the field',
            id: 'v2.event.library-membership.action.declare.form.section.who.field.firstname.label'
          }
        },
        {
          id: 'member.surname',
          type: FieldType.TEXT,
          required: true,
          conditionals: [],
          label: {
            defaultMessage: "Member's surname",
            description: 'This is the label for the field',
            id: 'v2.event.library-membership.action.declare.form.section.who.field.surname.label'
          }
        }
      ]
    }
  ]
})

/**
 * @knipignore
 */
export const libraryMembershipEvent = defineConfig({
  id: 'library-membership',
  label: {
    defaultMessage: 'Library membership application',
    description: 'This is what this event is referred as in the system',
    id: 'event.library-membership.label'
  },
  title: {
    defaultMessage: '{member.firstname} {member.surname}',
    description: 'This is the title of the summary',
    id: 'v2.event.library-membership.title'
  },
  summary: { fields: [] },
  actions: [],
  declaration: libraryMembershipForm
})
