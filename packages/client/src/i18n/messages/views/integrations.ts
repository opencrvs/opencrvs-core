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
  createClient: {
    id: 'integrations.createClient',
    defaultMessage: 'Create client',
    description: 'Label for the button creating client'
  },

  pageIntroduction: {
    id: 'integrations.pageIntroduction',
    defaultMessage:
      'For each new client that needs to integrate with OpenCRVS you can create unique client IDs. A number of integration use cases are currently supported, based on both API and webhook technologies.',
    description: 'Label for the text integration page intorduction'
  },
  revealKeys: {
    id: 'integrations.revealKeys',
    defaultMessage: 'Reveal Keys',
    description: 'Label for reveal keys option'
  },
  disable: {
    id: 'integrations.disable',
    defaultMessage: 'Disable',
    description: 'Label for disable option'
  },
  delete: {
    id: 'integrations.delete',
    defaultMessage: 'Delete',
    description: 'Label for delete option'
  },
  activate: {
    id: 'integrations.activate',
    defaultMessage: 'Activate',
    description: 'Label for activate option'
  },
  deactivate: {
    id: 'integrations.deactivate',
    defaultMessage: 'Deactivate',
    description: 'Label for deactivate option'
  },
  loading: {
    id: 'integrations.loading',
    defaultMessage: 'Loading',
    description: 'Label for loading option'
  },
  error: {
    id: 'integrations.error',
    defaultMessage: 'Something went wrong',
    description: 'Label for error option'
  },
  activateClient: {
    id: 'integrations.activate.client',
    defaultMessage: 'Activate Client?',
    description: 'Label for activate client option'
  },
  activateClientStatus: {
    id: 'integrations.activate.status',
    defaultMessage: 'Client activated',
    description: 'Label for activate client'
  },
  deactivateClientStatus: {
    id: 'integrations.deactivate.status',
    defaultMessage: 'Client deactivated',
    description: 'Label for deactivate client'
  },
  deactivateClient: {
    id: 'integrations.deactivate.client',
    defaultMessage: 'Deactivate Client?',
    description: 'Label for deactivate client option'
  },
  activateClientText: {
    id: 'integrations.activatetext',
    defaultMessage: 'This will activate the client',
    description: 'This will activate the client'
  },
  deactivateClientText: {
    id: 'integrations.deactivatetext',
    defaultMessage: 'This will deactivate the client',
    description: 'This will deactivate the client'
  }
}

export const integrationMessages = defineMessages(messagesToDefine)
