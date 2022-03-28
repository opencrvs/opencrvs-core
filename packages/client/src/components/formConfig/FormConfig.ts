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

interface IRecordAuditMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  introduction: MessageDescriptor
  child: MessageDescriptor
  mother: MessageDescriptor
  father: MessageDescriptor
  informant: MessageDescriptor
  documents: MessageDescriptor
  deceased: MessageDescriptor
  deathEvent: MessageDescriptor
  causeOfDeath: MessageDescriptor
  spouse: MessageDescriptor
  showHiddenFields: MessageDescriptor
  textInput: MessageDescriptor
  textAreaInput: MessageDescriptor
  numberInput: MessageDescriptor
  phoneNumberInput: MessageDescriptor
  heading: MessageDescriptor
  supportingCopy: MessageDescriptor
  add: MessageDescriptor
  addInputContent: MessageDescriptor
}

const messagesToDefine: IRecordAuditMessages = {
  introduction: {
    id: 'form.config.navigation.information',
    defaultMessage: 'Introduction',
    description: 'Label for Introduction in page navigation'
  },
  child: {
    id: 'form.config.navigation.child',
    defaultMessage: 'Child details',
    description: 'Label for children details in page navigation'
  },
  mother: {
    id: 'form.config.navigation.mother',
    defaultMessage: 'Mothers details',
    description: 'Label for mother details in page navigation'
  },
  father: {
    id: 'form.config.navigation.father',
    defaultMessage: 'Fathers details',
    description: 'Label for father details in page navigation'
  },
  informant: {
    id: 'form.config.navigation.informant',
    defaultMessage: 'Informant details',
    description: 'Label for informant details in page navigation'
  },
  documents: {
    id: 'form.config.navigation.documents',
    defaultMessage: 'Documents upload',
    description: 'Label for documents upload in page navigation'
  },
  deceased: {
    id: 'form.config.navigation.deceased',
    defaultMessage: 'Deceased details',
    description: 'Label for deceased details in page navigation'
  },
  deathEvent: {
    id: 'form.config.navigation.deathEvent',
    defaultMessage: 'Event details',
    description: 'Label for event details in page navigation'
  },
  causeOfDeath: {
    id: 'form.config.navigation.causeOfDeath',
    defaultMessage: 'Cause of death',
    description: 'Label for cause of death in page navigation'
  },
  spouse: {
    id: 'form.config.navigation.spouse',
    defaultMessage: 'Spouse details',
    description: 'Label for spouse details in page navigation'
  },
  showHiddenFields: {
    id: 'form.config.navigation.showHiddenFields',
    defaultMessage: 'Show hidden fields',
    description: 'Label for Show hidden fields in page navigation'
  },
  textInput: {
    id: 'form.config.navigation.textInput',
    defaultMessage: 'Text input',
    description: 'Label for Text Input in page navigation'
  },
  textAreaInput: {
    id: 'form.config.navigation.textAreaInput',
    defaultMessage: 'Text area input',
    description: 'Label for Text area input in page navigation'
  },
  numberInput: {
    id: 'form.config.navigation.numberInput',
    defaultMessage: 'Number input',
    description: 'Label for Number input in page navigation'
  },
  phoneNumberInput: {
    id: 'form.config.navigation.phoneNumberInput',
    defaultMessage: 'Phone number input',
    description: 'Label for Phone number input in page navigation'
  },
  heading: {
    id: 'form.config.navigation.heading',
    defaultMessage: 'Heading',
    description: 'Label for Heading in page navigation'
  },
  supportingCopy: {
    id: 'form.config.navigation.supportingCopy',
    defaultMessage: 'Supporting copy',
    description: 'Label for Supporting copy in page navigation'
  },
  add: {
    id: 'form.config.navigation.add',
    defaultMessage: 'Add',
    description: 'Label for Add in page navigation'
  },
  addInputContent: {
    id: 'form.config.navigation.addInputContent',
    defaultMessage: 'Add input/content',
    description: 'Label for Add input/content in page navigation'
  }
}
export const configMessage: IRecordAuditMessages =
  defineMessages(messagesToDefine)
