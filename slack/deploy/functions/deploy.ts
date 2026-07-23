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
import { DefineFunction, Schema, SlackFunction } from 'deno-slack-sdk/mod.ts'

export const DeployFunctionDefinition = DefineFunction({
  callback_id: 'deploy_function',
  title: 'Deploy OpenCRVS',
  description: 'Deploy OpenCRVS to a selected internal environment',
  source_file: 'functions/deploy.ts',
  input_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
        description: 'Message to be posted'
      },
      user: {
        type: Schema.slack.types.user_id,
        description: 'The user invoking the workflow'
      }
    },
    required: ['message', 'user']
  },
  output_parameters: {
    properties: {
      updatedMsg: {
        type: Schema.types.string,
        description: 'Updated message to be posted'
      }
    },
    required: ['updatedMsg']
  }
})

/**
 * SlackFunction takes in two arguments: the CustomFunction
 * definition (see above), as well as a function that contains
 * handler logic that's run when the function is executed.
 * https://api.slack.com/automation/functions/custom
 */
export default SlackFunction(DeployFunctionDefinition, async ({ inputs }) => {
  const updatedMsg = `:wave: <@${inputs.user}> submitted the following message: \n\n>${inputs.message}`

  return { outputs: { updatedMsg } }
})
