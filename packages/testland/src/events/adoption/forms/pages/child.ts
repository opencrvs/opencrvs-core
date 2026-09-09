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
  defineConditional,
  defineFormPage,
  FieldType,
  PageTypes,
  field
} from '@opencrvs/toolkit/events'
import { Event } from '@countryconfig/events/utils'
import {
  farajalandNameConfig,
  invalidNameValidator
} from '@countryconfig/events/birth/validators'

export const child = defineFormPage({
  id: 'child',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Adopted child's details",
    description: 'Form section title for the adopted child',
    id: 'form.adoption.child.title'
  },
  fields: [
    {
      id: 'child.name',
      type: FieldType.NAME,
      required: true,
      configuration: farajalandNameConfig,
      hideLabel: true,
      label: {
        defaultMessage: "Child's name at birth",
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.child.field.name.label'
      },
      validation: [invalidNameValidator('child.name')]
    },
    {
      id: 'child.dob',
      type: FieldType.DATE,
      required: true,
      secured: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'event.adoption.action.declare.form.section.child.field.dob.error'
          },
          validator: field('child.dob').isBefore().now()
        }
      ],
      label: {
        defaultMessage: "Child's date of birth",
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.child.field.dob.label'
      }
    },
    {
      id: 'child.brn',
      type: FieldType.SEARCH,
      required: true,
      label: {
        defaultMessage: 'Original birth record BRN',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.child.field.brn.label'
      },
      helperText: {
        defaultMessage:
          "Search for the child's original birth record by its Birth Registration Number (BRN). This record will be sealed once the adoption is registered.",
        description: 'This is the helper text for the field',
        id: 'event.adoption.action.declare.form.section.child.field.brn.helperText'
      },
      configuration: {
        query: {
          type: 'or',
          clauses: [
            {
              eventType: Event.Birth,
              'legalStatuses.REGISTERED.registrationNumber': {
                term: '{term}',
                type: 'exact'
              }
            }
          ]
        },
        limit: 1,
        offset: 0,
        validation: {
          validator: defineConditional({
            type: 'string',
            pattern: '^[A-Za-z0-9]{12}$',
            description: 'Must be alpha-numeric and 12 characters long'
          }),
          message: {
            defaultMessage:
              'Invalid value: Must be alpha-numeric and 12 characters long',
            description: 'Error message for invalid value',
            id: 'event.adoption.action.declare.form.section.child.field.brn.validation.invalid'
          }
        },
        indicators: {
          ok: {
            defaultMessage: 'Birth record found',
            description: 'OK button text',
            id: 'event.adoption.action.declare.form.section.child.field.brn.indicators.ok'
          },
          noResultsError: {
            defaultMessage: 'No birth record found with this BRN',
            description: 'Text to display when no results are found',
            id: 'event.adoption.action.declare.form.section.child.field.brn.indicators.noResultsError'
          },
          clearModal: {
            title: {
              defaultMessage: 'Clear birth record?',
              description: 'Title for the clear confirmation modal',
              id: 'event.adoption.action.declare.form.section.child.field.brn.indicators.clearModal.title'
            },
            description: {
              defaultMessage:
                'This will remove the link to the original birth record.',
              description: 'Description for the clear confirmation modal',
              id: 'event.adoption.action.declare.form.section.child.field.brn.indicators.clearModal.description'
            }
          }
        }
      }
    }
  ]
})
