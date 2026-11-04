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
import fs from 'node:fs'
import path from 'node:path'
import type { Reporter, Suite, TestCase } from '@playwright/test/reporter'

/**
 * Records every test that needed more than one attempt.
 *
 * The CTRF and html reports only keep a test's final attempt, so a test that
 * passes on retry looks healthy there even though its failed attempts (often a
 * full test timeout each) decide how long the shard runs. This writes them to
 * `retries/retries.json`, which summarise-retries.mjs collects across shards
 * for the run summary and Slack. On GitHub Actions it also annotates each
 * flaky test so it shows up on the PR.
 */
export default class RetryReporter implements Reporter {
  private suite!: Suite

  onBegin(_config: unknown, suite: Suite) {
    this.suite = suite
  }

  onEnd() {
    const retried = this.suite
      .allTests()
      .filter((test) => test.results.length > 1)
      .map((test) => this.toRetryRecord(test))

    // Written even when empty: on a re-run it supersedes the earlier attempt's file.
    fs.mkdirSync('retries', { recursive: true })
    fs.writeFileSync(
      path.join('retries', 'retries.json'),
      JSON.stringify(retried, null, 2)
    )

    if (!process.env.GITHUB_ACTIONS) {
      return
    }

    for (const test of retried.filter(({ outcome }) => outcome === 'flaky')) {
      const cost = Math.round(test.retryCostMs / 1000)
      const title = `Flaky: passed on attempt ${test.attempts.length}, ${cost}s lost to retries`
      const message = `${test.title}: ${test.firstError}`
      // eslint-disable-next-line no-console
      console.log(
        `::warning file=${escapeProperty(test.file)},line=${test.line},title=${escapeProperty(title)}::${escapeData(message)}`
      )
    }
  }

  private toRetryRecord(test: TestCase) {
    const attempts = test.results.map((result) => ({
      status: result.status,
      durationMs: result.duration,
      error: firstLine(result.errors[0]?.message)
    }))
    const total = attempts.reduce((sum, { durationMs }) => sum + durationMs, 0)

    return {
      // Annotations resolve file paths from the repository root.
      file: path.relative(
        process.env.GITHUB_WORKSPACE ?? process.cwd(),
        test.location.file
      ),
      line: test.location.line,
      // Drop the root, project and file segments.
      title: test.titlePath().slice(3).join(' › '),
      outcome: test.outcome(),
      attempts,
      retryCostMs: total - attempts[attempts.length - 1].durationMs,
      firstError: attempts.find(({ error }) => error)?.error ?? ''
    }
  }
}

function firstLine(message: string | undefined) {
  return (message ?? '').replace(/\x1b\[[0-9;]*m/g, '').split('\n')[0]
}

// Workflow command escaping, as GitHub's @actions/core does it.
function escapeData(text: string) {
  return text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')
}

function escapeProperty(text: string) {
  return escapeData(text).replace(/:/g, '%3A').replace(/,/g, '%2C')
}
