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
import { ActionType } from '../events/ActionType'
import { TranslationConfig } from '../events/TranslationConfig'
import { createFieldConditionals } from '../conditionals/conditionals'
import { field } from '../client'

function generateTranslationConfig(message: string): TranslationConfig {
  return {
    defaultMessage: message,
    description: 'Description for ${message}',
    id: message
  }
}
const child = defineFormPage({
  id: 'child',
  type: PageTypes.enum.FORM,
  title: generateTranslationConfig("Child's details"),
  fields: [
    {
      id: 'child.name',
      type: FieldType.NAME,
      required: true,
      configuration: { maxLength: 32 },
      hideLabel: true,
      label: generateTranslationConfig("Child's name"),
      validation: []
    },
    {
      id: 'child.dob',
      type: 'DATE',
      required: true,
      secured: true,
      validation: [],
      label: generateTranslationConfig('Date of birth')
    },
    {
      id: 'child.placeOfBirth',
      analytics: true,
      type: FieldType.SELECT,
      required: true,
      secured: true,
      label: {
        defaultMessage: 'Place of delivery',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.placeOfBirth.label'
      },
      options: [
        {
          value: 'child.placeOfBirth-SELECT-2',
          label: generateTranslationConfig('Health Institution')
        },
        {
          value: 'PRIVATE_HOME',
          label: generateTranslationConfig('Residential address')
        }
      ]
    },
    {
      id: 'child.birthLocation',
      analytics: true,
      type: 'FACILITY',
      required: true,
      secured: true,
      label: generateTranslationConfig('Health Institution'),
      conditionals: [
        {
          type: 'SHOW',
          conditional: field('child.placeOfBirth').isEqualTo(
            'child.placeOfBirth-SELECT-2'
          )
        }
      ]
    },
    {
      id: 'child.birthLocation.privateHome',
      analytics: true,
      type: FieldType.ADDRESS,
      secured: true,
      hideLabel: true,
      label: generateTranslationConfig("Child's address"),
      conditionals: [
        {
          type: 'SHOW',
          conditional: field('child.placeOfBirth').isEqualTo('PRIVATE_HOME')
        }
      ],
      configuration: {
        streetAddressForm: []
      }
    }
  ]
})

const mother = defineFormPage({
  id: 'mother',
  type: PageTypes.enum.FORM,
  title: generateTranslationConfig("Mother's details"),
  fields: [
    {
      id: 'mother.name',
      type: FieldType.NAME,
      required: true,
      configuration: { maxLength: 32 },
      hideLabel: true,
      label: generateTranslationConfig("Mother's name"),
      conditionals: [],
      validation: []
    },
    {
      id: 'mother.dob',
      type: 'DATE',
      required: true,
      secured: true,
      validation: [],
      label: generateTranslationConfig('Date of birth'),
      conditionals: []
    },
    {
      id: 'mother.idType',
      type: FieldType.SELECT,
      required: true,
      label: generateTranslationConfig('Type of ID'),
      options: [
        {
          value: 'NID',
          label: generateTranslationConfig('National ID')
        },
        {
          value: 'PASSPORT',
          label: generateTranslationConfig('Passport')
        },
        {
          value: 'NONE',
          label: generateTranslationConfig('None')
        }
      ],
      conditionals: []
    },
    {
      id: 'mother.nid',
      type: FieldType.ID,
      required: true,
      label: generateTranslationConfig('National ID'),
      conditionals: [
        {
          type: 'SHOW',
          conditional: createFieldConditionals('mother.idType').isEqualTo('NID')
        }
      ],
      validation: []
    },
    {
      id: 'mother.passport',
      type: FieldType.ID,
      required: true,
      label: generateTranslationConfig('Passport'),
      conditionals: [
        {
          type: 'SHOW',
          conditional:
            createFieldConditionals('mother.idType').isEqualTo('PASSPORT')
        }
      ],
      validation: []
    }
  ]
})

const BIRTH_DECLARATION_REVIEW = {
  title: generateTranslationConfig(
    '{child.name.firstname, select, __EMPTY__ {Birth declaration} other {{child.name.surname, select, __EMPTY__ {Birth declaration for {child.name.firstname}} other {Birth declaration for {child.name.firstname} {child.name.surname}}}}}'
  ),
  fields: [
    {
      id: 'review.comment',
      type: FieldType.TEXTAREA,
      label: generateTranslationConfig('Comment'),
      required: true
    },
    {
      type: FieldType.SIGNATURE,
      id: 'review.signature',
      required: true,
      label: generateTranslationConfig('Signature of informant'),
      signaturePromptLabel: generateTranslationConfig('Draw signature')
    }
  ]
}

const BIRTH_DECLARATION_FORM = defineDeclarationForm({
  label: generateTranslationConfig('Birth decalration form'),

  pages: [child, mother]
})

export const v2BirthEvent = defineConfig({
  id: BIRTH_EVENT,
  title: generateTranslationConfig(
    '{child.name.firstname} {child.name.surname}'
  ),
  label: generateTranslationConfig('Birth'),
  summary: {
    fields: []
  },
  declaration: BIRTH_DECLARATION_FORM,
  actions: [
    {
      type: ActionType.READ,
      label: generateTranslationConfig('Read'),
      review: BIRTH_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: generateTranslationConfig('Declare'),
      review: BIRTH_DECLARATION_REVIEW
    },
    {
      type: ActionType.VALIDATE,
      label: generateTranslationConfig('Validate')
    },
    {
      type: ActionType.REGISTER,
      label: generateTranslationConfig('Register')
    }
  ],
  advancedSearch: []
})
