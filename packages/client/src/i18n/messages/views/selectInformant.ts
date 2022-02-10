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
import { Message } from 'typescript-react-intl'

interface IFormMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  name: MessageDescriptor
  title: MessageDescriptor
  whoIsBirthInformant: MessageDescriptor
  whoIsDeathInformant: Message
  grandfather: MessageDescriptor
  grandmother: MessageDescriptor
  brother: MessageDescriptor
  sister: MessageDescriptor
  legalGuardian: MessageDescriptor
  informantError: MessageDescriptor
}

const messagesToDefine: IFormMessages = {
  name: {
    id: 'informant.name',
    defaultMessage: 'Informant',
    description: 'Informant section name'
  },
  title: {
    id: 'informant.title',
    defaultMessage: 'Select Informant',
    description: 'Informant section title'
  },
  whoIsBirthInformant: {
    defaultMessage: 'Who is informant',
    description: 'Label for option birth informant',
    id: 'form.field.label.applicantRelation.whoIsBirthInformant'
  },
  whoIsDeathInformant: {
    defaultMessage: 'Who is informant',
    description: 'Label for option death informant',
    id: 'form.field.label.applicantRelation.whoIsDeathInformant'
  },
  informantError: {
    id: 'correction.informant.error',
    defaultMessage: 'Please select who is informant',
    description: 'Error for corrector form'
  },
  mother: {
    defaultMessage: 'Mother',
    description: 'Label for option mother',
    id: 'form.field.label.applicantRelation.mother'
  },
  father: {
    defaultMessage: 'Father',
    description: 'Label for option father',
    id: 'form.field.label.applicantRelation.father'
  },
  grandfather: {
    defaultMessage: 'Grandfather',
    description: 'Label for option Grandfather',
    id: 'form.field.label.applicantRelation.grandfather'
  },
  grandmother: {
    defaultMessage: 'Grandmother',
    description: 'Label for option Grandmother',
    id: 'form.field.label.applicantRelation.grandmother'
  },
  brother: {
    defaultMessage: 'Brother',
    description: 'Label for option brother',
    id: 'form.field.label.applicantRelation.brother'
  },
  sister: {
    defaultMessage: 'Sister',
    description: 'Label for option Sister',
    id: 'form.field.label.applicantRelation.sister'
  },
  legalGuardian: {
    defaultMessage: 'Legal guardian',
    description: 'Label for option Legal Guardian',
    id: 'form.field.label.applicantRelation.legalGuardian'
  },
  others: {
    defaultMessage: 'Someone else',
    description: 'Label for option someone else',
    id: 'form.field.label.applicantRelation.others'
  },
  birthInformantTitle: {
    defaultMessage: 'Who is applying for birth registration?',
    description: 'Who is applying for birth registration',
    id: 'register.selectInformant.birthInformantTitle'
  },
  deathInformantTitle: {
    defaultMessage: 'Who is applying for death registration?',
    description: 'Who is applying for death registration',
    id: 'register.selectInformant.deathInformantTitle'
  }
}

export const formMessages: IFormMessages = defineMessages(messagesToDefine)
