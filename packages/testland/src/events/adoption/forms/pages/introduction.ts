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

export const introduction = defineFormPage({
  id: 'introduction',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage:
      'Introduce the adoption registration process to the applicant',
    description: 'Event information title for the adoption',
    id: 'register.eventInfo.adoption.title'
  },
  fields: [
    {
      type: FieldType.BULLET_LIST,
      id: 'form.section.information.adoption.bulletList',
      label: {
        defaultMessage: 'Adoption Information',
        id: 'form.section.information.adoption.bulletList.label',
        description: 'Label for the adoption information bullet list'
      },
      hideLabel: true,
      items: [
        {
          defaultMessage:
            'I am going to help you make a declaration of adoption.',
          description: 'Form information for adoption',
          id: 'form.section.information.adoption.bullet1'
        },
        {
          defaultMessage:
            "The adopted child's National ID is used to locate the original birth record, which will be sealed once the adoption is registered.",
          description: 'Form information for adoption',
          id: 'form.section.information.adoption.bullet2'
        }
      ],
      configuration: {
        styles: {
          fontVariant: 'reg16'
        }
      }
    }
  ]
})
