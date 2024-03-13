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
import { defineMessages, MessageDescriptor } from 'react-intl'
import { Message } from 'typescript-react-intl'

interface IFormMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  name: MessageDescriptor
  title: MessageDescriptor
  whoIsBirthInformant: MessageDescriptor
  whoIsDeathInformant: Message
  GRANDFATHER: MessageDescriptor
  GRANDMOTHER: MessageDescriptor
  MOTHER: MessageDescriptor
  FATHER: MessageDescriptor
  BROTHER: MessageDescriptor
  SISTER: MessageDescriptor
  LEGAL_GUARDIAN: MessageDescriptor
  informantError: MessageDescriptor
  SPOUSE: MessageDescriptor
  SON: MessageDescriptor
  OTHER: MessageDescriptor
  SON_IN_LAW: MessageDescriptor
  GRANDSON: MessageDescriptor
  DAUGHTER: MessageDescriptor
  DAUGHTER_IN_LAW: MessageDescriptor
  GRANDDAUGHTER: MessageDescriptor
  birthErrorMessage: MessageDescriptor
  deathErrorMessage: MessageDescriptor
  OTHER_FAMILY_MEMBER: MessageDescriptor
  birthInformantTitle: MessageDescriptor
  deathInformantTitle: MessageDescriptor
  marriageInformantTitle: MessageDescriptor
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
    id: 'form.field.label.informantRelation.whoIsBirthInformant'
  },
  whoIsDeathInformant: {
    defaultMessage: 'Who is informant',
    description: 'Label for option death informant',
    id: 'form.field.label.informantRelation.whoIsDeathInformant'
  },
  informantError: {
    id: 'correction.informant.error',
    defaultMessage: 'Please select who is informant',
    description: 'Error for corrector form'
  },
  MOTHER: {
    defaultMessage: 'Mother',
    description: 'Label for option mother',
    id: 'form.field.label.informantRelation.mother'
  },
  FATHER: {
    defaultMessage: 'Father',
    description: 'Label for option father',
    id: 'form.field.label.informantRelation.father'
  },
  GROOM: {
    defaultMessage: 'Groom',
    description: 'Label for option groom',
    id: 'form.field.label.informantRelation.groom'
  },
  BRIDE: {
    defaultMessage: 'Bride',
    description: 'Label for option bride',
    id: 'form.field.label.informantRelation.bride'
  },
  groomAndBride: {
    defaultMessage: 'Groom & Bride',
    description: 'Label for option Groom & Bride',
    id: 'form.field.label.informantRelation.groomAndBride'
  },
  GRANDFATHER: {
    defaultMessage: 'Grandfather',
    description: 'Label for option Grandfather',
    id: 'form.field.label.informantRelation.grandfather'
  },
  GRANDMOTHER: {
    defaultMessage: 'Grandmother',
    description: 'Label for option Grandmother',
    id: 'form.field.label.informantRelation.grandmother'
  },
  BROTHER: {
    defaultMessage: 'Brother',
    description: 'Label for option brother',
    id: 'form.field.label.informantRelation.brother'
  },
  SISTER: {
    defaultMessage: 'Sister',
    description: 'Label for option Sister',
    id: 'form.field.label.informantRelation.sister'
  },
  LEGAL_GUARDIAN: {
    defaultMessage: 'Legal guardian',
    description: 'Label for option Legal Guardian',
    id: 'form.field.label.informantRelation.legalGuardian'
  },
  OTHER: {
    defaultMessage: 'Someone else',
    description: 'Label for option someone else',
    id: 'form.field.label.informantRelation.others'
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
  },
  marriageInformantTitle: {
    defaultMessage: 'Who is applying for marriage registration?',
    description: 'Who is applying for marriage registration',
    id: 'register.selectInformant.marriageInformantTitle'
  },
  SPOUSE: {
    defaultMessage: 'Spouse',
    description: 'Label for option Spouse',
    id: 'form.field.label.informantRelation.spouse'
  },
  SON: {
    defaultMessage: 'Son',
    description: 'Label for option Son',
    id: 'form.field.label.informantRelation.son'
  },
  SON_IN_LAW: {
    defaultMessage: 'Son in law',
    description: 'Label for option Son in law',
    id: 'form.field.label.informantRelation.sonInLaw'
  },
  GRANDSON: {
    defaultMessage: 'Grandson',
    description: 'Label for option Grandson',
    id: 'form.field.label.informantRelation.grandson'
  },
  DAUGHTER: {
    defaultMessage: 'Daughter',
    description: 'Label for option Daughter',
    id: 'form.field.label.informantRelation.daughter'
  },
  DAUGHTER_IN_LAW: {
    defaultMessage: 'Daughter in law',
    description: 'Label for option Daughter in law',
    id: 'form.field.label.informantRelation.daughterInLaw'
  },
  GRANDDAUGHTER: {
    defaultMessage: 'Granddaughter',
    description: 'Label for option Granddaughter',
    id: 'form.field.label.informantRelation.granddaughter'
  },
  birthErrorMessage: {
    defaultMessage: 'Please select who is present and applying',
    description: 'Label for birth error message',
    id: 'register.selectInformant.birthErrorMessage'
  },
  deathErrorMessage: {
    defaultMessage: 'Please select the relationship to the deceased.',
    description: 'Label for death error message',
    id: 'register.selectInformant.deathErrorMessage'
  },
  OTHER_FAMILY_MEMBER: {
    defaultMessage: 'Other family member',
    description: 'Label for other family member relation',
    id: 'form.field.label.relationOtherFamilyMember'
  }
}

export const messages: IFormMessages = defineMessages(messagesToDefine)
