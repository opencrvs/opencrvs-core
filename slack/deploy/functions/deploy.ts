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

// The deploy workflow lives in the infrastructure repo and runs from its
// default branch. `WORKFLOW` is the workflow file name as accepted by the
// GitHub REST API's workflow-dispatch endpoint.
const REPO = 'opencrvs/opencrvs-testland-infrastructure'
const WORKFLOW = 'deploy-opencrvs.yml'
const INFRA_REF = 'develop'

const POLL_ATTEMPTS = 10
const POLL_DELAY_MS = 2000

export const DeployFunctionDefinition = DefineFunction({
  callback_id: 'deploy_function',
  title: 'Deploy OpenCRVS',
  description: 'Deploy OpenCRVS to a selected internal environment',
  source_file: 'functions/deploy.ts',
  input_parameters: {
    properties: {
      user: {
        type: Schema.slack.types.user_id,
        description: 'The user invoking the workflow'
      },
      channel: {
        type: Schema.slack.types.channel_id,
        description: 'Channel to post the deployment message in'
      },
      environment: {
        type: Schema.types.string,
        description: 'Target environment'
      },
      tag: {
        type: Schema.types.string,
        description: 'opencrvs-core branch name, tag, or commit hash'
      }
    },
    required: ['user', 'channel', 'environment', 'tag']
  },
  output_parameters: {
    properties: {},
    required: []
  }
})

/**
 * Map the user-supplied ref to the image tag opencrvs-core publishes:
 * a commit hash → the 7-char tag (build-images-from-branch.yml tags images
 * with `git rev-parse HEAD | cut -c1-7`); anything else is treated as a
 * branch/tag name and sanitized the same way core sanitizes it for its moving
 * image tags. An empty ref defaults to `develop`.
 */
function resolveImageTag(ref: string): string {
  const trimmed = (ref || 'develop').trim()
  if (/^[0-9a-fA-F]{7,40}$/.test(trimmed)) {
    return trimmed.slice(0, 7).toLowerCase()
  }
  return trimmed.replace(/[^a-zA-Z0-9_.-]/g, '-')
}

function githubHeaders(token: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    // GitHub rejects API requests without a User-Agent.
    'User-Agent': 'opencrvs-slack-deploy'
  }
}

/**
 * workflow_dispatch responds 204 with no run id, so we can't learn the run URL
 * from the dispatch call. Poll the workflow's runs (newest first) for one
 * created at or after `since` and return its html_url.
 */
async function findRunUrl(
  token: string,
  since: string
): Promise<string | null> {
  const query = `event=workflow_dispatch&per_page=5&created=${encodeURIComponent(
    `>=${since}`
  )}`
  const url = `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/runs?${query}`

  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS))
    const res = await fetch(url, { headers: githubHeaders(token) })
    if (!res.ok) {
      continue
    }
    const body = await res.json()
    const runUrl = body?.workflow_runs?.[0]?.html_url
    if (typeof runUrl === 'string') {
      return runUrl
    }
  }
  return null
}

// deno-lint-ignore no-explicit-any
type Blocks = Array<Record<string, any>>

function startedBlocks(args: {
  user: string
  environment: string
  tag: string
  coreImageTag: string
  runLink: string
}): Blocks {
  const { user, environment, tag, coreImageTag, runLink } = args
  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: ':ship: Deployment started', emoji: true }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Environment*\n\`${environment}\`` },
        { type: 'mrkdwn', text: `*Triggered by*\n<@${user}>` },
        { type: 'mrkdwn', text: `*Ref*\n\`${tag}\`` },
        { type: 'mrkdwn', text: `*Image tag*\n\`${coreImageTag}\`` }
      ]
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `:mag: <${runLink}|Follow the deployment progress →>` }
    }
  ]
}

function errorBlocks(args: {
  user: string
  environment: string
  coreImageTag: string
  reason: string
}): Blocks {
  const { user, environment, coreImageTag, reason } = args
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          `:x: <@${user}> — failed to trigger a deployment to *${environment}* ` +
          `(core: \`${coreImageTag}\`).\n${reason}`
      }
    }
  ]
}

export default SlackFunction(
  DeployFunctionDefinition,
  async ({ inputs, env, client }) => {
    const { user, channel, environment, tag } = inputs
    const coreImageTag = resolveImageTag(tag)
    const token = env.GITHUB_TOKEN

    const post = (text: string, blocks: Blocks) =>
      client.chat.postMessage({ channel, text, blocks })

    if (!token) {
      await post(
        `Deployment to ${environment} could not be triggered`,
        errorBlocks({
          user,
          environment,
          coreImageTag,
          reason:
            'The `GITHUB_TOKEN` environment variable is not set for this app.'
        })
      )
      return { outputs: {} }
    }

    // Timestamp (whole seconds) a little before the dispatch, so the run this
    // creates falls within the `created>=` poll window.
    const since = new Date(Date.now() - 30_000)
      .toISOString()
      .replace(/\.\d+Z$/, 'Z')

    const dispatchRes = await fetch(
      `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
      {
        method: 'POST',
        headers: githubHeaders(token),
        body: JSON.stringify({
          ref: INFRA_REF,
          inputs: {
            environment,
            'core-image-tag': coreImageTag
          }
        })
      }
    )

    if (!dispatchRes.ok) {
      const detail = await dispatchRes.text()
      await post(
        `Deployment to ${environment} failed to start`,
        errorBlocks({
          user,
          environment,
          coreImageTag,
          reason: `GitHub responded ${dispatchRes.status}: ${
            detail || dispatchRes.statusText
          }`
        })
      )
      return { outputs: {} }
    }

    const runUrl = await findRunUrl(token, since)
    const runLink =
      runUrl ?? `https://github.com/${REPO}/actions/workflows/${WORKFLOW}`

    await post(
      `${environment} deployment started by <@${user}> (core: ${coreImageTag}) — ${runLink}`,
      startedBlocks({ user, environment, tag, coreImageTag, runLink })
    )

    return { outputs: {} }
  }
)
