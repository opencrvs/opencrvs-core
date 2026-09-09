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

// Shortcut/link trigger URL, shown as a footer so people can re-run the deploy
// straight from the result message. Override per-environment with a TRIGGER_URL
// env var; otherwise this value is used. Get it from `slack triggers list` (or
// the output of `slack trigger create`).
const TRIGGER_URL =
  'https://slack.com/shortcuts/Ft0BK5Q27NQ5/797f688b8548e9dc77e400c9d5a3500d'

// The result message is always posted to this channel, regardless of where the
// trigger link was clicked. Override with an OUTPUT_CHANNEL env var if needed.
// This is #opencrvs-developers on Slack
const OUTPUT_CHANNEL = 'C02LU432JGK'

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
      environment: {
        type: Schema.types.string,
        description: 'Target environment'
      },
      tag: {
        type: Schema.types.string,
        description: 'opencrvs-core branch name, tag, or commit hash'
      }
    },
    required: ['user', 'environment', 'tag']
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

// Small greyed footer linking back to the trigger, so a deploy can be re-run
// straight from the result message.
function rerunFooter(triggerUrl: string): Blocks[number] {
  return {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `This deployment was made with the Slack Deployment workflow. Workflow link: <${triggerUrl}|Deploy OpenCRVS>`
      }
    ]
  }
}

function startedBlocks(args: {
  user: string
  environment: string
  tag: string
  coreImageTag: string
  runLink: string
  triggerUrl: string
}): Blocks {
  const { user, environment, tag, coreImageTag, runLink, triggerUrl } = args
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: ':ship: Deployment started',
        emoji: true
      }
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
      text: {
        type: 'mrkdwn',
        text: `:mag: <${runLink}|Follow the deployment progress →>`
      }
    },
    {
      type: 'divider'
    },
    rerunFooter(triggerUrl)
  ]
}

function errorBlocks(args: {
  user: string
  environment: string
  coreImageTag: string
  reason: string
  triggerUrl: string
}): Blocks {
  const { user, environment, coreImageTag, reason, triggerUrl } = args
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          `:x: <@${user}> — failed to trigger a deployment to *${environment}* ` +
          `(core: \`${coreImageTag}\`).\n${reason}`
      }
    },
    rerunFooter(triggerUrl)
  ]
}

export default SlackFunction(
  DeployFunctionDefinition,
  async ({ inputs, env, client }) => {
    const { user, environment, tag } = inputs
    const coreImageTag = resolveImageTag(tag)
    const token = env.GITHUB_TOKEN
    const triggerUrl = env.TRIGGER_URL ?? TRIGGER_URL
    const outputChannel = env.OUTPUT_CHANNEL ?? OUTPUT_CHANNEL

    const post = (text: string, blocks: Blocks) =>
      client.chat.postMessage({ channel: outputChannel, text, blocks })

    if (!token) {
      await post(
        `Deployment to ${environment} could not be triggered`,
        errorBlocks({
          user,
          environment,
          coreImageTag,
          triggerUrl,
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
          triggerUrl,
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
      startedBlocks({
        user,
        environment,
        tag,
        coreImageTag,
        runLink,
        triggerUrl
      })
    )

    return { outputs: {} }
  }
)
