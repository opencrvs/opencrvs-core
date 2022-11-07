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

  clientId: {
    id: 'integrations.clientId',
    defaultMessage: 'Client ID',
    description: 'Label for client Id'
  },

  clientSecret: {
    id: 'integrations.clientSecret',
    defaultMessage: 'Client Secret',
    description: 'Label for client secret'
  },
  shaSecret: {
    id: 'integrations.shaSecret',
    defaultMessage: 'SHA Secret',
    description: 'Label for SHA secret'
  },
  disable: {
    id: 'integrations.disable',
    defaultMessage: 'Disable',
    description: 'Label for disable option'
  },
  enable: {
    id: 'integrations.enable',
    defaultMessage: 'Enable',
    description: 'Label for enable option'
  },

  uniqueKeysDescription: {
    id: 'integrations.uniqueKeyDescription',
    defaultMessage:
      'These unique keys will be required by the client integrating...',
    description: 'Label for the unique key description'
  },

  delete: {
    id: 'integrations.delete',
    defaultMessage: 'Delete',
    description: 'Label for delete option'
  },
  active: {
    id: 'integrations.active',
    defaultMessage: 'Active',
    description: 'Label for active integration'
  },
  inactive: {
    id: 'integrations.inactive',
    defaultMessage: 'Inactive',
    description: 'Label for inactive integration'
  }
}

export const integrationMessages = defineMessages(messagesToDefine)
