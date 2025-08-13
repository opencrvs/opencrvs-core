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
import {
  defineFormPage,
  defineDeclarationForm
} from '../events/EventConfigInput'
import { PageTypes } from '../events/PageConfig'
import { FieldType } from '../events/FieldType'
import { BIRTH_EVENT } from '../events/Constants'

const child = defineFormPage({
  id: 'child',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Child's details",
    description: 'Form section title for Child',
    id: 'v2.form.birth.child.title'
  },
  fields: [
    {
      id: 'child.name',
      type: FieldType.NAME,
      required: true,
      configuration: { maxLength: 32 },
      hideLabel: true,
      label: {
        defaultMessage: "Child's name",
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.name.label'
      },
      validation: []
    },
    {
      id: 'child.dob',
      type: 'DATE',
      required: true,
      secured: true,
      validation: [],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.dob.label'
      }
    }
  ]
})

const mother = defineFormPage({
  id: 'mother',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Mother's details",
    description: 'Form section title for mothers details',
    id: 'v2.form.section.mother.title'
  },
  fields: [
    {
      id: 'mother.name',
      type: FieldType.NAME,
      required: true,
      configuration: { maxLength: 32 },
      hideLabel: true,
      label: {
        defaultMessage: "Mother's name",
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.mother.field.name.label'
      },
      conditionals: [],
      validation: []
    },
    {
      id: 'mother.dob',
      type: 'DATE',
      required: true,
      secured: true,
      validation: [],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.dob.label'
      },
      conditionals: []
    },
    {
      id: 'mother.nid',
      type: FieldType.ID,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.nid.label'
      },
      conditionals: [],
      validation: []
    }
  ]
})

const BIRTH_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Birth decalration form',
    id: 'v2.event.birth.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [child, mother]
})

export const v2BirthEvent = defineConfig({
  id: BIRTH_EVENT,
  title: {
    defaultMessage: '{child.name.firstname} {child.name.surname}',
    description: 'This is the title of the summary',
    id: 'v2.event.birth.title'
  },
  label: {
    defaultMessage: 'Birth',
    description: 'This is what this event is referred as in the system',
    id: 'v2.event.birth.label'
  },
  summary: {
    fields: []
  },
  actions: [],
  declaration: BIRTH_DECLARATION_FORM
})
