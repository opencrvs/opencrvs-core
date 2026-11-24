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

export const deathIntroduction = defineFormPage({
  id: 'introduction',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Introduce the death registration process to the informant',
    description: 'Event information title for the death',
    id: 'register.eventInfo.death.title'
  },
  fields: [
    {
      type: FieldType.BULLET_LIST,
      id: 'form.section.information.death.bulletList',
      label: {
        defaultMessage: 'Death Information',
        id: 'form.section.information.death.bulletList.label',
        description: 'Label for the death information bullet list'
      },
      hideLabel: true,
      items: [
        {
          defaultMessage: 'I am going to help you make a declaration of death.',
          description: 'Form information for death',
          id: 'form.section.information.death.bullet1'
        },
        {
          defaultMessage:
            'As the legal Informant it is important that all the information provided by you is accurate.',
          description: 'Form information for death',
          id: 'form.section.information.death.bullet2'
        },
        {
          defaultMessage:
            'Once the declaration is processed you will receive an email to tell you when to visit the office to collect the certificate - Take your ID with you.',
          description: 'Form information for death',
          id: 'form.section.information.death.bullet3'
        },
        {
          defaultMessage:
            'Make sure you collect the certificate. A death certificate is critical to support with inheritance claims and to resolve the affairs of the deceased e.g. closing bank accounts and setting loans.',
          description: 'Form information for death',
          id: 'form.section.information.death.bullet4'
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
