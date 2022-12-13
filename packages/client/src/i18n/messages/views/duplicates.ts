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
import { defineMessages } from 'react-intl'

const messagesToDefine = {
  headerTitle: {
    id: 'duplicates.duplicateFoundTitle',
    defaultMessage: 'Possible duplicate declaration',
    description: 'Title for review duplicate page'
  },
  potentialDuplicateWarning: {
    id: 'duplicates.possibleDuplicateFound',
    defaultMessage: 'Potential duplicate of original record',
    description:
      'Warning text that shows above the potential duplicate declaration'
  }
}

export const messages = defineMessages(messagesToDefine)
