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
 * Bin-packs e2e spec files across N CI shards by estimated duration, instead
 * of Playwright's own --shard, which cuts shards by alphabetical file order
 * and raw test count. Prints a compact JSON array to stdout, suitable for a
 * GitHub Actions `strategy.matrix.include`:
 *
 *   [{ "shard": 1, "files": ["a/x.spec.ts", ...], "totalWeightMs": 123 }, ...]
 *
 * Usage: npx tsx e2e/compute-shard-plan.ts [--shards=20] [--weights=path] [--prefix=e2e/testcases/]
 *
 * --prefix is prepended to each output file path (e.g. so CI can pass the
 * result straight to `playwright test` from the package root); it has no
 * effect on weight lookups, which always use the bare testcases-relative path.
 */
import fs from 'fs'
import path from 'path'

const TESTCASES_DIR = path.join(__dirname, 'testcases')
const DEFAULT_WEIGHTS_PATH = path.join(__dirname, 'shard-weights.json')

// Median of the currently measured entries in shard-weights.json — used for
// every spec file we haven't measured yet, so the plan stays roughly sane
// until real data backfills it.
const DEFAULT_WEIGHT_MS = 55100

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {}
  for (const arg of argv) {
    // Matches --key=value, e.g. --shards=25; splits on the first '=' only,
    // so a value itself containing '=' is captured whole.
    const match = /^--([^=]+)=(.*)$/.exec(arg)
    if (match) {
      args[match[1]] = match[2]
    }
  }
  return {
    shards: Number(args.shards ?? 20),
    weightsPath: args.weights ?? DEFAULT_WEIGHTS_PATH,
    prefix: args.prefix ?? ''
  }
}

function collectSpecFiles(dir: string): string[] {
  const includeDashboard = process.env.DASHBOARD_E2E === 'true'
  const results: string[] = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // dashboard/ specs need a separate DASHBOARD_E2E-gated deployment and
      // aren't part of the normal shard plan.
      if (
        !includeDashboard &&
        path.relative(TESTCASES_DIR, fullPath) === 'dashboard'
      ) {
        continue
      }
      results.push(...collectSpecFiles(fullPath))
    } else if (/\.spec\.tsx?$/.test(entry.name)) {
      results.push(
        path.relative(TESTCASES_DIR, fullPath).split(path.sep).join('/')
      )
    }
  }

  return results
}

function loadWeights(weightsPath: string): Record<string, number> {
  const raw = JSON.parse(fs.readFileSync(weightsPath, 'utf8'))
  delete raw._comment
  return raw
}

type Shard = { shard: number; files: string[]; totalWeightMs: number }

// Longest Processing Time (LPT) bin-packing: place the heaviest files first,
// each one into whichever shard currently has the smallest total. Placing
// heavy files first matters — packing small ones first can leave a shard
// with no room left for a large one, and no reshuffling happens afterwards.
function packShards(
  files: string[],
  weights: Record<string, number>,
  shardCount: number
): Shard[] {
  const shards: Shard[] = Array.from({ length: shardCount }, (_, i) => ({
    shard: i + 1,
    files: [],
    totalWeightMs: 0
  }))

  const weighted = files
    .map((file) => ({ file, weight: weights[file] ?? DEFAULT_WEIGHT_MS }))
    .sort((a, b) => b.weight - a.weight) // descending, e.g. [90s, 60s, 10s]

  for (const { file, weight } of weighted) {
    const lightestShard = shards.reduce((lightest, shard) =>
      shard.totalWeightMs < lightest.totalWeightMs ? shard : lightest
    )
    lightestShard.files.push(file)
    lightestShard.totalWeightMs += weight
  }

  return shards.sort((a, b) => b.totalWeightMs - a.totalWeightMs)
}

function main() {
  const {
    shards: shardCount,
    weightsPath,
    prefix
  } = parseArgs(process.argv.slice(2))
  const files = collectSpecFiles(TESTCASES_DIR)
  const weights = loadWeights(weightsPath)
  const plan = packShards(files, weights, shardCount)

  for (const s of plan) {
    console.error(
      `shard ${String(s.shard).padStart(2, '0')}: ${(s.totalWeightMs / 1000).toFixed(1).padStart(7)}s  (${s.files.length} files)`
    )
  }

  const output = prefix
    ? plan.map((s) => ({ ...s, files: s.files.map((f) => `${prefix}${f}`) }))
    : plan

  process.stdout.write(JSON.stringify(output))
}

main()
