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
 * Averages per-test durations from downloaded CTRF report.json files into
 * per-spec-file weights, keyed the same way as shard-weights.json (path
 * relative to e2e/testcases). Prints {file: averageMs} to stdout.
 *
 * Usage: npx tsx e2e/aggregate-shard-weights.ts <reports-dir>
 */
import fs from 'fs'
import path from 'path'

const TESTCASES_MARKER = 'e2e/testcases/'

// Minimal shape of a CTRF report.json (playwright-ctrf-json-reporter output)
// - only the fields this script reads; the real report has many more.
type CtrfReport = {
  results?: {
    tests?: Array<{ filePath?: string; duration?: number }>
  }
}

// Recursively walks `dir`, since report artifacts are downloaded one
// subdirectory per shard (e.g. ctrf-report-shard-1-<run-id>/report.json).
function findJsonFiles(dir: string): string[] {
  const results: string[] = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findJsonFiles(fullPath))
    } else if (entry.name.endsWith('.json')) {
      results.push(fullPath)
    }
  }

  return results
}

function relativeToTestcases(filePath: string): string {
  const index = filePath.indexOf(TESTCASES_MARKER)
  // No marker means an unexpected path shape (e.g. from a report generated
  // outside this repo layout) - keep it as-is rather than dropping the test.
  return index === -1
    ? filePath
    : filePath.slice(index + TESTCASES_MARKER.length)
}

function main() {
  const reportsDir = process.argv[2]
  if (!reportsDir) {
    console.error('Usage: aggregate-shard-weights.ts <reports-dir>')
    process.exit(1)
  }

  const totals: Record<string, number> = {}
  const occurrences: Record<string, number> = {}
  const reportFiles = findJsonFiles(reportsDir)

  for (const file of reportFiles) {
    const report: CtrfReport = JSON.parse(fs.readFileSync(file, 'utf8'))

    // Sum within this report first, so a multi-test file is one per-run total.
    const perReportTotals: Record<string, number> = {}
    for (const test of report.results?.tests ?? []) {
      // Playwright's CTRF reporter always sets both fields - this guards
      // against a malformed/truncated report.json, not expected data.
      if (!test.filePath || typeof test.duration !== 'number') {
        continue
      }
      const key = relativeToTestcases(test.filePath)
      perReportTotals[key] = (perReportTotals[key] ?? 0) + test.duration
    }

    for (const [key, total] of Object.entries(perReportTotals)) {
      totals[key] = (totals[key] ?? 0) + total
      occurrences[key] = (occurrences[key] ?? 0) + 1
    }
  }

  console.error(
    `aggregated ${Object.keys(totals).length} files from ${reportFiles.length} report(s)`
  )

  const sorted: Record<string, number> = {}
  for (const key of Object.keys(totals).sort()) {
    sorted[key] = Math.round(totals[key] / occurrences[key])
  }

  process.stdout.write(JSON.stringify(sorted))
}

main()
