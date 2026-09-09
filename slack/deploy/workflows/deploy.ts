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
import { DefineWorkflow, Schema } from 'deno-slack-sdk/mod.ts'
import { DeployFunctionDefinition } from '../functions/deploy.ts'

const DeployWorkflow = DefineWorkflow({
  callback_id: 'deploy_workflow',
  title: 'Deploy OpenCRVS',
  description: 'Deploy OpenCRVS to a selected internal environment',
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      channel: { type: Schema.slack.types.channel_id },
      user: { type: Schema.slack.types.user_id }
    },
    required: ['interactivity', 'channel', 'user']
  }
})

const inputForm = DeployWorkflow.addStep(Schema.slack.functions.OpenForm, {
  title: 'Deploy OpenCRVS',
  interactivity: DeployWorkflow.inputs.interactivity,
  submit_label: 'Deploy',
  fields: {
    elements: [
      {
        name: 'environment',
        title: 'Environment',
        type: Schema.types.string,
        enum: ['qa'],
        default: 'qa'
      },
      {
        name: 'tag',
        title: 'Branch, tag or commit hash',
        type: Schema.types.string,
        default: 'develop'
      }
    ],
    required: ['environment', 'tag']
  }
})

// The function triggers the deployment and posts the (Block Kit) result
// message itself (always to a fixed channel — see OUTPUT_CHANNEL in the
// function), so no separate SendMessage step is needed.
DeployWorkflow.addStep(DeployFunctionDefinition, {
  user: DeployWorkflow.inputs.user,
  environment: inputForm.outputs.fields.environment,
  tag: inputForm.outputs.fields.tag
})

export default DeployWorkflow
