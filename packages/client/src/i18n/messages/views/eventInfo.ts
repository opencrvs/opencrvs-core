/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { defineMessages, MessageDescriptor } from 'react-intl'

interface IEventInfoMessages
  extends Record<
    string,
    MessageDescriptor | { [key: string]: MessageDescriptor }[]
  > {
  title: MessageDescriptor
  birthBulletListItems: { [key: string]: MessageDescriptor }[]
  deathBulletListItems: { [key: string]: MessageDescriptor }[]
  adoptionBulletListItems: { [key: string]: MessageDescriptor }[]
  marriageBulletListItems: { [key: string]: MessageDescriptor }[]
  divorceBulletListItems: { [key: string]: MessageDescriptor }[]
}

const birthBulletListItemsToDefine: MessageDescriptor[] = [
  {
    id: 'register.eventInfo.birth.listItem0',
    defaultMessage:
      'I am here to help you start the birth registration process for your child.',
    description: 'Event info bullet list item for birth'
  },
  {
    id: 'register.eventInfo.birth.listItem1',
    defaultMessage:
      'A birth certificate is extremely important for this child, especially to make their life easier in the future. It will assist access to health care, school examinations and other government benefits.',
    description: 'Event info bullet list item for birth'
  },
  {
    id: 'register.eventInfo.birth.listItem2',
    defaultMessage:
      'Make sure you collect the certificate of your child when it is ready.',
    description: 'Event info bullet list item for birth'
  }
]

const deathBulletListItemsToDefine: MessageDescriptor[] = [
  {
    id: 'register.eventInfo.death.listItem0',
    defaultMessage:
      'I am here to complete the death registration declaration for you. ',
    description: 'Event info bullet list item for death'
  },
  {
    id: 'register.eventInfo.death.listItem1',
    defaultMessage:
      'Once I complete the declaration, it will be sent to the registration office for review.',
    description: 'Event info bullet list item for death'
  },
  {
    id: 'register.eventInfo.death.listItem2',
    defaultMessage:
      'Wait for an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
    description: 'Event info bullet list item for death'
  }
]

const marriageBulletListItemsToDefine: MessageDescriptor[] = [
  {
    id: 'register.eventInfo.marriage.listItem0',
    defaultMessage:
      'I am here to complete the marriage registration declaration for you. ',
    description: 'Event info bullet list item for marriage'
  },
  {
    id: 'register.eventInfo.marriage.listItem1',
    defaultMessage:
      'Once I complete the declaration, it will be sent to the registration office for review.',
    description: 'Event info bullet list item for marriage'
  },
  {
    id: 'register.eventInfo.marriage.listItem2',
    defaultMessage:
      'Wait for an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
    description: 'Event info bullet list item for marriage'
  }
]

const divorceBulletListItemsToDefine: MessageDescriptor[] = [
  {
    id: 'register.eventInfo.divorce.listItem0',
    defaultMessage:
      'I am here to complete the divorce registration declaration for you. ',
    description: 'Event info bullet list item for divorce'
  },
  {
    id: 'register.eventInfo.divorce.listItem1',
    defaultMessage:
      'Once I complete the declaration, it will be sent to the registration office for review.',
    description: 'Event info bullet list item for divorce'
  },
  {
    id: 'register.eventInfo.divorce.listItem2',
    defaultMessage:
      'Wait for an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
    description: 'Event info bullet list item for divorce'
  }
]

const adoptionBulletListItemsToDefine: MessageDescriptor[] = [
  {
    id: 'register.eventInfo.adoption.listItem0',
    defaultMessage:
      'I am here to complete the adoption registration declaration for you. ',
    description: 'Event info bullet list item for adoption'
  },
  {
    id: 'register.eventInfo.adoption.listItem1',
    defaultMessage:
      'Once I complete the declaration, it will be sent to the registration office for review.',
    description: 'Event info bullet list item for adoption'
  },
  {
    id: 'register.eventInfo.adoption.listItem2',
    defaultMessage:
      'Wait for an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
    description: 'Event info bullet list item for adoption'
  }
]

const messagesToDefine = {
  title: {
    id: 'register.eventInfo.event.title',
    defaultMessage:
      'Introduce the {eventType, select, birth{birth} death{death} marriage{marriage} divorce{divorce} adoption{adoption} other{birth}} registration process to the informant'
  }
}

export const messages: IEventInfoMessages = {
  ...defineMessages(messagesToDefine),
  birthBulletListItems: birthBulletListItemsToDefine.map(
    (birthMessage, index) => {
      return defineMessages({ index: birthMessage })
    }
  ),
  deathBulletListItems: deathBulletListItemsToDefine.map(
    (deathMessage, index) => {
      return defineMessages({ index: deathMessage })
    }
  ),
  marriageBulletListItems: marriageBulletListItemsToDefine.map(
    (marriageMessage, index) => {
      return defineMessages({ index: marriageMessage })
    }
  ),
  divorceBulletListItems: divorceBulletListItemsToDefine.map(
    (divorceMessage, index) => {
      return defineMessages({ index: divorceMessage })
    }
  ),
  adoptionBulletListItems: adoptionBulletListItemsToDefine.map(
    (adoptionMessage, index) => {
      return defineMessages({ index: adoptionMessage })
    }
  )
}
