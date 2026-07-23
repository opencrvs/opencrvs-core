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
import { Manifest } from 'deno-slack-sdk/mod.ts'
import DeployWorkflow from './workflows/deploy.ts'

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: 'deploy',
  description: 'Deploy OpenCRVS to a selected internal environment',
  icon: 'assets/default_new_app_icon.png',
  workflows: [DeployWorkflow],
  outgoingDomains: [],
  datastores: [],
  botScopes: [
    'commands',
    'chat:write',
    'chat:write.public',
    'datastore:read',
    'datastore:write'
  ]
})
