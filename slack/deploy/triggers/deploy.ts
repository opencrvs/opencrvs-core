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
import type { Trigger } from 'deno-slack-sdk/types.ts'
import { TriggerContextData, TriggerTypes } from 'deno-slack-api/mod.ts'
import DeployWorkflow from '../workflows/deploy.ts'

const deployTrigger: Trigger<typeof DeployWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: 'Deploy OpenCRVS',
  description: 'Deploy OpenCRVS to a selected internal environment',
  workflow: `#/workflows/${DeployWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id
    },
    user: {
      value: TriggerContextData.Shortcut.user_id
    }
  }
}

export default deployTrigger
