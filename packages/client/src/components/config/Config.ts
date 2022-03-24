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
  childDetails: MessageDescriptor
  mothersDetails: MessageDescriptor
  fathersDetails: MessageDescriptor
  informantDetails: MessageDescriptor
  documentsUpload: MessageDescriptor
}

const messagesToDefine: IRecordAuditMessages = {
  introduction: {
    id: 'form.config.navigation.information',
    defaultMessage: 'Introduction',
    description: 'Label for Introduction in page navigation'
  },
  childDetails: {
    id: 'form.config.navigation.childDetails',
    defaultMessage: 'Child details',
    description: 'Label for children details in page navigation'
  },
  mothersDetails: {
    id: 'form.config.navigation.mothersDetails',
    defaultMessage: 'Mothers details',
    description: 'Label for mother details in page navigation'
  },
  fathersDetails: {
    id: 'form.config.navigation.fathersDetails',
    defaultMessage: 'Fathers details',
    description: 'Label for father details in page navigation'
  },
  informantDetails: {
    id: 'form.config.navigation.informantDetails',
    defaultMessage: 'Informant details',
    description: 'Label for informant details in page navigation'
  },
  documentsUpload: {
    id: 'form.config.navigation.documentsUpload',
    defaultMessage: 'Documents upload',
    description: 'Label for documents upload in page navigation'
  }
}
export const configMessage: IRecordAuditMessages =
  defineMessages(messagesToDefine)
