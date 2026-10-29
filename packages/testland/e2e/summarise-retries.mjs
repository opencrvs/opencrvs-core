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

/**
 * Summarises the retries recorded by retry-reporter.ts across all shards.
 *
 *   node summarise-retries.mjs <dir>
 *
 * <dir> holds one sub-directory per shard artifact
 * (`retries-shard-<n>-attempt-<run attempt>`), each
 * with a retries.json. Writes a table to the job summary, a warning annotation
 * with the totals, and a `slack` step output (empty when nothing was retried)
 * for workflows that post to Slack. Plain .mjs so it runs on bare Node, with no
 * install, in both e2e-tests.yml here and opencrvs-testland-infrastructure.
 */
import fs from 'node:fs'
import path from 'node:path'

const SLACK_TOP = 5

const dir = process.argv[2]
const tests = []
const latestByShard = new Map()

if (dir && fs.existsSync(dir)) {
  for (const artifact of fs.readdirSync(dir)) {
    const match = artifact.match(/^retries-shard-(.+)-attempt-(\d+)$/)
    const file = path.join(dir, artifact, 'retries.json')
    if (!match || !fs.existsSync(file)) continue
    const [, shard, attempt] = match
    // A re-run leaves the earlier attempt's artifact behind; keep the latest.
    if (Number(attempt) > (latestByShard.get(shard)?.attempt ?? 0)) {
      latestByShard.set(shard, { attempt: Number(attempt), file })
    }
  }
}

for (const [shard, { file }] of latestByShard) {
  for (const test of JSON.parse(fs.readFileSync(file, 'utf8'))) {
    tests.push({ ...test, shard })
  }
}

tests.sort((a, b) => b.retryCostMs - a.retryCostMs)

const seconds = (ms) => `${Math.round(ms / 1000)}s`
const displayOutcome = (test) =>
  test.outcome === 'unexpected' ? 'failed' : test.outcome
// Errors quote markup like `<li disabled>`; Slack mrkdwn treats these as control characters too.
const escapeMarkup = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const retryCostMs = tests.reduce((sum, test) => sum + test.retryCostMs, 0)
const flaky = tests.filter((test) => test.outcome === 'flaky').length
const headline =
  `${tests.length} test(s) needed a retry (${flaky} flaky), ` +
  `${seconds(retryCostMs)} spent beyond a single attempt`

writeSummary()
writeSlackOutput()

if (tests.length > 0) {
  // eslint-disable-next-line no-console
  console.log(`::warning title=E2E retries::${headline}`)
}

function writeSummary() {
  if (!process.env.GITHUB_STEP_SUMMARY) return

  if (tests.length === 0) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      'No test needed a retry ✨\n'
    )
    return
  }

  const escapeCell = (text) => escapeMarkup(text).replace(/\|/g, '\\|')

  const rows = tests.map((test) =>
    [
      escapeCell(`${test.file}:${test.line} › ${test.title}`),
      displayOutcome(test),
      test.attempts.map(({ status }) => status).join(' → '),
      seconds(test.retryCostMs),
      test.shard,
      escapeCell(test.firstError)
    ].join(' | ')
  )

  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [
      '## E2E retries',
      '',
      `${headline}.`,
      '',
      'Test | Outcome | Attempts | Lost | Shard | First error',
      '--- | --- | --- | --- | --- | ---',
      ...rows,
      ''
    ].join('\n')
  )
}

function writeSlackOutput() {
  if (!process.env.GITHUB_OUTPUT) return

  const lines =
    tests.length === 0
      ? []
      : [
          `⚠️ ${headline}:`,
          ...tests
            .slice(0, SLACK_TOP)
            .map(
              (test) =>
                `• \`${escapeMarkup(path.basename(test.file))}\` ${escapeMarkup(test.title)} — ${displayOutcome(test)}, ${seconds(test.retryCostMs)}`
            ),
          ...(tests.length > SLACK_TOP
            ? [`…and ${tests.length - SLACK_TOP} more in the run summary`]
            : [])
        ]

  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `slack<<RETRIES_EOF\n${lines.join('\n')}\nRETRIES_EOF\n`
  )
}
