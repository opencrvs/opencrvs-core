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

import { defineFormPage, FieldType, PageTypes } from '@opencrvs/toolkit/events'

export const adoptionOrder = defineFormPage({
  id: 'adoptionOrder',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Adoption order details',
    description: 'Form section title for the adoption order',
    id: 'form.adoption.adoptionOrder.title'
  },
  fields: [
    {
      id: 'adoptionOrder.reference',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Adoption court order reference',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionOrder.field.reference.label'
      }
    },
    {
      id: 'adoptionOrder.issuingAuthority',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Court / issuing authority',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionOrder.field.issuingAuthority.label'
      }
    },
    {
      id: 'adoptionOrder.date',
      type: FieldType.DATE,
      required: true,
      label: {
        defaultMessage: 'Date of adoption order',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionOrder.field.date.label'
      }
    },
    {
      id: 'adoptionOrder.divider',
      type: FieldType.DIVIDER,
      label: {
        defaultMessage: '',
        description: 'empty string',
        id: 'messages.emptyString'
      }
    },
    {
      id: 'child.newFirstName',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: "Child's new first name(s) (post-adoption)",
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionOrder.field.newFirstName.label'
      }
    },
    {
      id: 'child.newLastName',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: "Child's new last name (post-adoption)",
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionOrder.field.newLastName.label'
      }
    }
  ]
})
