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
      interactivity: {
        type: Schema.slack.types.interactivity
      },
      channel: {
        type: Schema.slack.types.channel_id
      },
      user: {
        type: Schema.slack.types.user_id
      }
    },
    required: ['interactivity', 'channel', 'user']
  }
})

const inputForm = DeployWorkflow.addStep(Schema.slack.functions.OpenForm, {
  title: 'Send message to channel',
  interactivity: DeployWorkflow.inputs.interactivity,
  submit_label: 'Send message',
  fields: {
    elements: [
      {
        name: 'channel',
        title: 'Channel to send message to',
        type: Schema.slack.types.channel_id,
        default: DeployWorkflow.inputs.channel
      },
      {
        name: 'message',
        title: 'Message',
        type: Schema.types.string,
        long: true
      }
    ],
    required: ['channel', 'message']
  }
})

/**
 * Custom functions are reusable building blocks
 * of automation deployed to Slack infrastructure. They
 * accept inputs, perform calculations, and provide
 * outputs, just like typical programmatic functions.
 * https://api.slack.com/automation/functions/custom
 */
const deployFunctionStep = DeployWorkflow.addStep(DeployFunctionDefinition, {
  message: inputForm.outputs.fields.message,
  user: DeployWorkflow.inputs.user
})

/**
 * SendMessage is a Slack function. These are
 * Slack-native actions, like creating a channel or sending
 * a message and can be used alongside custom functions in a workflow.
 * https://api.slack.com/automation/functions
 */
DeployWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: inputForm.outputs.fields.channel,
  message: deployFunctionStep.outputs.updatedMsg
})

export default DeployWorkflow
