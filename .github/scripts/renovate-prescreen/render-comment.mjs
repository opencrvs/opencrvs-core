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

// Builds the PR comment from the facts and from Claude's structured output.
// The facts give the answers that code can find. Claude gives the answers
// that need judgement.
//
// Usage: node render-comment.mjs <facts.json> <result.json> [<base-sha>]
// Prints Markdown.

import { readFileSync } from 'node:fs'

// The workflow finds an earlier comment by this marker and edits it.
const MARKER = '<!-- renovate-prescreen -->'

const [factsPath, resultPath, baseSha] = process.argv.slice(2)
if (!factsPath || !resultPath) {
  console.error('usage: render-comment.mjs <facts.json> <result.json> [<sha>]')
  process.exit(2)
}

const facts = JSON.parse(readFileSync(factsPath, 'utf8'))
const result = JSON.parse(readFileSync(resultPath, 'utf8'))

/**
 * Claude's text comes from a model that read untrusted advisory text. Keep
 * it on one table line as plain text: no mentions, links, images or HTML.
 */
function clean(text) {
  return String(text ?? '')
    .replace(/\r?\n+/g, ' ')
    .split(/(`[^`]*`)/)
    .map((part, index) =>
      // Odd parts are code spans. GitHub shows code as text: it does not read
      // mentions, links or HTML in code, so "`@nx/devkit`" stays as it is.
      // A pipe in a code span still ends the table cell, so escape it. A code
      // span cannot escape a backslash, so a "\|" in code stays a risk.
      index % 2 === 1
        ? part.replace(/\|/g, '\\|')
        : escapeMentions(escapeMarkup(part))
    )
    .join('')
    .trim()
}

/**
 * Stops GitHub from reading the text as HTML, as a link or image, or as an
 * autolink. A zero-width space after "://" and in "www." stops the autolink.
 */
function escapeMarkup(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[[\]]/g, '\\$&')
    .replace(/:\/\//g, ':/\u200b/')
    .replace(/\bwww\./gi, (match) => `${match.slice(0, 3)}\u200b.`)
}

/**
 * GitHub reads "@name" and "@org/team" as a mention only after a space or a
 * punctuation mark, so "glob@10.5.0" stays as it is. A zero-width space
 * after the "@" stops the mention.
 */
function escapeMentions(text) {
  return text.replace(/(^|[^\w`.@-])@(?=[A-Za-z0-9])/g, '$1@\u200b')
}

function evidenceList(items) {
  if (!items || items.length === 0) {
    return ''
  }
  return items.map((item) => `- ${clean(item)}`).join('\n')
}

const ACTION_LABELS = {
  'merge now': '🔴 Merge now',
  'merge later': '🟡 Merge later',
  close: '⚪ Close'
}

function ageRow() {
  return facts.packages
    .flatMap(({ name, npm }) => {
      if (npm.error) {
        return [`\`${name}\`: unknown (${clean(npm.error)})`]
      }
      return npm.targets.map((target) => {
        if (target.ageInDays === null) {
          return `\`${name}@${target.version}\`: unknown (no publish date)`
        }
        const verdict = target.publishedMoreThanAMonthAgo ? 'Yes' : 'No'
        return `${verdict}. \`${name}@${target.version}\` was published ${target.ageInDays} days ago.`
      })
    })
    .join('<br>')
}

function maintenanceFacts() {
  return facts.packages
    .map(({ name, npm }) => {
      if (npm.error) {
        return ''
      }
      const parts = [
        npm.daysSinceLastPublish === null
          ? 'last npm publish unknown'
          : `last npm publish ${npm.daysSinceLastPublish} days ago`
      ]
      if (npm.githubRepository?.archived) {
        parts.push('the repository is archived')
      } else if (npm.githubRepository?.daysSinceLastPush != null) {
        parts.push(
          `last push to the repository ${npm.githubRepository.daysSinceLastPush} days ago`
        )
      }
      if (npm.latestDeprecated) {
        parts.push(`deprecated: ${clean(npm.latestDeprecated)}`)
      }
      return `\`${name}\`: ${parts.join(', ')}.`
    })
    .filter(Boolean)
    .join('<br>')
}

const updates = facts.updates
  .map(
    (u) =>
      `\`${u.renovateName}\` ${u.from} → ${u.to}${u.onlyUnder ? ` (only the copies under \`${u.onlyUnder}\`)` : ''}`
  )
  .join(', ')

const advisories = facts.advisories
  .map((a) =>
    a.error
      ? `${a.id} (not found)`
      : `[${a.id}](${a.url}) ${a.severity}: ${clean(a.summary)}`
  )
  .join('<br>')

const { usage, maintenance, buildOrRuntime, appliesTo, affected } = result
const { recommendation } = result

const maintenanceAnswer = [
  `**${clean(maintenance.status)}**. ${clean(maintenance.explanation)}`,
  maintenance.alternative
    ? `Alternative: ${clean(maintenance.alternative)}`
    : '',
  maintenanceFacts()
]
  .filter(Boolean)
  .join('<br>')

const lines = [
  MARKER,
  '## Security prescreen',
  '',
  `**Recommendation: ${ACTION_LABELS[recommendation.action]}.** ${clean(recommendation.reason)}`,
  ''
]

if (recommendation.followUp) {
  lines.push(`**Follow-up:** ${clean(recommendation.followUp)}`, '')
}

lines.push(
  `**Update:** ${updates}`,
  '',
  `**Advisories:**<br>${advisories || 'None found in the PR body.'}`,
  '',
  '| Question | Answer |',
  '|---|---|',
  `| Do we use it, and is it direct or transitive? | **${clean(usage.dependencyType)}**. ${clean(usage.explanation)} |`,
  `| Is it maintained? | ${maintenanceAnswer} |`,
  `| Build time or runtime? | **${clean(buildOrRuntime.answer)}**. ${clean(buildOrRuntime.explanation)} |`,
  `| Client, server or both? | **${clean(appliesTo.answer)}**. ${clean(appliesTo.explanation)} |`,
  `| Does the advisory affect our usage? | **${clean(affected.answer)}**. ${clean(affected.explanation)} |`,
  `| Was the new version published more than a month ago? | ${ageRow()} |`,
  ''
)

const usageEvidence = evidenceList(usage.evidence)
const affectedEvidence = evidenceList(affected.evidence)
if (usageEvidence || affectedEvidence) {
  lines.push('<details><summary>Evidence</summary>', '')
  if (usageEvidence) {
    lines.push('**Usage**', '', usageEvidence, '')
  }
  if (affectedEvidence) {
    lines.push('**Advisory impact**', '', affectedEvidence, '')
  }
  lines.push('</details>', '')
}

lines.push(
  `<sub>Claude wrote this prescreen from the base branch${baseSha ? ` at ${baseSha.slice(0, 10)}` : ''}. Check the evidence before you act.</sub>`
)

console.log(lines.join('\n'))
