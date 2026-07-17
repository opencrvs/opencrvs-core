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
    defaultMessage: 'Introduce the birth registration process to the informant',
    description: 'Event information title for the birth',
    id: 'register.eventInfo.birth.title'
  },
  fields: [
    {
      type: FieldType.BULLET_LIST,
      id: 'form.section.information.birth.bulletList',
      label: {
        defaultMessage: 'Birth Information',
        id: 'form.section.information.birth.bulletList.label',
        description: 'Label for the birth information bullet list'
      },
      hideLabel: true,
      items: [
        {
          defaultMessage: 'I am going to help you make a declaration of birth.',
          description: 'Form information for birth',
          id: 'form.section.information.birth.bullet1'
        },
        {
          defaultMessage:
            'As the legal Informant it is important that all the information provided by you is accurate.',
          description: 'Form information for birth',
          id: 'form.section.information.birth.bullet2'
        },
        {
          defaultMessage:
            'Once the declaration is processed you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
          description: 'Form information for birth',
          id: 'form.section.information.birth.bullet3.sms'
        },
        {
          defaultMessage:
            'Make sure you collect the certificate. A birth certificate is critical for this child, especially to make their life easy later on. It will help to access health services, school examinations and government benefits.',
          description: 'Form information for birth',
          id: 'form.section.information.birth.bullet4'
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
