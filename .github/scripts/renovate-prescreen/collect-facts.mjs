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

// Collects the facts about a Renovate security PR that code can find
// without judgement: the updated packages, the advisories, the npm
// metadata and where the lockfiles install each package. Claude reads the
// result, so it does not need to look these up itself.
//
// Usage: node collect-facts.mjs <pr-number> <lockfile.json>:<label> [...]
// Env:   GH_TOKEN, GITHUB_REPOSITORY
// Prints JSON.

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { loadLockfile } from './dependency-chains.mjs'

const execFileAsync = promisify(execFile)

const ONE_MONTH_IN_DAYS = 30
const MAX_ADVISORY_DESCRIPTION = 4000
const MAX_DIFF = 20000

const [prNumber, ...lockfiles] = process.argv.slice(2)
if (!prNumber || lockfiles.length === 0) {
  console.error(
    'usage: collect-facts.mjs <pr-number> <lockfile.json>:<label> [...]'
  )
  process.exit(2)
}

/**
 * Runs gh without a block, so that the lookups for several packages run at
 * the same time. stderr stays out of the log: a failed lookup is recorded in
 * the facts.
 */
async function gh(args) {
  const { stdout } = await execFileAsync('gh', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  })
  return stdout
}

async function ghJson(args) {
  return JSON.parse(await gh(args))
}

function errorText(error) {
  return String(error.stderr || error.message).trim()
}

function truncate(text, max) {
  if (!text || text.length <= max) {
    return text
  }
  return `${text.slice(0, max)}\n[truncated ${text.length - max} characters]`
}

function daysSince(isoDate) {
  if (!isoDate) {
    return null
  }
  return Math.floor((Date.now() - Date.parse(isoDate)) / 86_400_000)
}

/**
 * Renovate writes one table row for each update. The row links to
 * renovatebot.com/diffs/npm/<package>/<from>/<to>, and the first cell holds
 * the Renovate name, for example "node-gyp>glob" for a scoped override.
 * The name is a markdown link when Renovate knows the homepage or the
 * source of the package, and plain text when it does not.
 */
function findUpdates(body) {
  const updates = []
  const row =
    /^\|\s*(?:\[([^\]]+)\][^|]*|([^|[]+?))\s*\|.*?renovatebot\.com\/diffs\/npm\/(.+?)\/([^/\s)]+)\/([^/\s)]+)\)/gm
  for (const match of body.matchAll(row)) {
    const [, linkedName, plainName, diffName, from, to] = match
    const renovateName = (linkedName ?? plainName).replaceAll('`', '').trim()
    // "node-gyp>glob" is an override of glob for the copies that node-gyp
    // installs. The npm package is the last name.
    const names = decodeURIComponent(diffName).split('>')
    updates.push({
      renovateName,
      package: names[names.length - 1],
      onlyUnder: names.length > 1 ? names.slice(0, -1).join('>') : null,
      from,
      to
    })
  }
  // The same update can appear in more than one row, for example when two
  // workspace packages depend on different majors of the package.
  return updates.filter(
    (update, index) =>
      updates.findIndex(
        (other) => JSON.stringify(other) === JSON.stringify(update)
      ) === index
  )
}

const GHSA_ID = /GHSA(?:-[23456789cfghjmpqrvwx]{4}){3}/g

/**
 * The advisories of the vulnerability alerts. Renovate writes each alert as
 * a "### <summary>" heading, and the next line links the CVE and the GHSA
 * ID. The release notes and the changelogs come after "### Release Notes"
 * and can name other advisories, so the IDs there are not used.
 */
function findAdvisoryIds(body) {
  const alerts = body.split(/^### (?:Release Notes|Configuration)\s*$/m)[0]
  const lines = alerts.split('\n')
  const ids = lines.flatMap((line, index) =>
    index > 0 && /^### /.test(lines[index - 1])
      ? (line.match(GHSA_ID) ?? [])
      : []
  )
  return [...new Set(ids)]
}

async function fetchAdvisory(id) {
  try {
    const advisory = await ghJson(['api', `advisories/${id}`])
    return {
      id,
      cve: advisory.cve_id,
      url: advisory.html_url,
      summary: advisory.summary,
      severity: advisory.severity,
      publishedAt: advisory.published_at,
      cwes: (advisory.cwes ?? []).map((cwe) => `${cwe.cwe_id} ${cwe.name}`),
      vulnerabilities: (advisory.vulnerabilities ?? []).map((v) => ({
        package: v.package?.name,
        vulnerableVersionRange: v.vulnerable_version_range,
        firstPatchedVersion: v.first_patched_version,
        vulnerableFunctions: v.vulnerable_functions
      })),
      description: truncate(advisory.description, MAX_ADVISORY_DESCRIPTION)
    }
  } catch (error) {
    return { id, error: errorText(error) }
  }
}

function githubRepositoryOf(repositoryUrl) {
  const match = /github\.com[/:]([^/]+)\/([^/#]+?)(?:\.git)?(?:[/#]|$)/.exec(
    repositoryUrl ?? ''
  )
  return match ? `${match[1]}/${match[2]}` : null
}

/**
 * The time of the newest version publish. "time.modified" is not used: it
 * also changes when only the metadata changes, for example a deprecation.
 */
function lastPublishOf(packument) {
  const publishTimes = Object.entries(packument.time ?? {})
    .filter(([key]) => key !== 'created' && key !== 'modified')
    .map(([, time]) => time)
    .sort((a, b) => Date.parse(a) - Date.parse(b))
  return publishTimes.at(-1) ?? null
}

async function fetchPackument(packageName) {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${packageName.replaceAll('/', '%2F')}`
    )
    if (!response.ok) {
      return { error: `npm registry returned ${response.status}` }
    }
    return { packument: await response.json() }
  } catch (error) {
    return { error: `npm registry request failed: ${error.message}` }
  }
}

async function fetchNpmFacts(packageName, targetVersions) {
  const { packument, error } = await fetchPackument(packageName)
  if (error) {
    return { error }
  }
  const latest = packument['dist-tags']?.latest
  const targets = targetVersions.map((version) => {
    const publishedAt = packument.time?.[version] ?? null
    const ageInDays = daysSince(publishedAt)
    return {
      version,
      publishedAt,
      ageInDays,
      publishedMoreThanAMonthAgo:
        ageInDays === null ? null : ageInDays > ONE_MONTH_IN_DAYS,
      deprecated: packument.versions?.[version]?.deprecated ?? null
    }
  })
  const lastPublishAt = lastPublishOf(packument)
  const repositoryUrl =
    typeof packument.repository === 'string'
      ? packument.repository
      : packument.repository?.url
  const repository = githubRepositoryOf(repositoryUrl)

  let githubRepository = null
  if (repository) {
    try {
      const repo = await ghJson(['api', `repos/${repository}`])
      githubRepository = {
        name: repo.full_name,
        archived: repo.archived,
        lastPushAt: repo.pushed_at,
        daysSinceLastPush: daysSince(repo.pushed_at)
      }
    } catch (error) {
      // Record the real error: a rate limit or a network error does not
      // mean that the repository is gone.
      githubRepository = { name: repository, error: errorText(error) }
    }
  }

  return {
    // One entry for each target version of the package in the PR.
    targets,
    latestVersion: latest,
    latestDeprecated: packument.versions?.[latest]?.deprecated ?? null,
    lastPublishAt,
    daysSinceLastPublish: daysSince(lastPublishAt),
    githubRepository
  }
}

// Read each lockfile and build its graph once, for all the packages.
const lockfileGraphs = lockfiles.map((entry) => {
  const [path, label = path] = entry.split(':')
  return loadLockfile(path, label)
})

function findUsage(packageName) {
  return lockfileGraphs.map((graph) => graph.usageOf(packageName))
}

/**
 * Only the manifest changes: the lockfile diff is long and adds nothing.
 * The files API returns a patch for each file. "gh pr diff" is not used,
 * because GitHub refuses the full diff when the lockfile diff is too large.
 */
async function manifestDiff() {
  try {
    const files = (
      await gh([
        'api',
        '--paginate',
        `repos/${process.env.GITHUB_REPOSITORY}/pulls/${prNumber}/files`,
        '--jq',
        '.[] | {filename, patch}'
      ])
    )
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .filter((file) => !/(^|\/)pnpm-lock\.yaml$/.test(file.filename))
    return truncate(
      files
        .map(
          (file) =>
            `diff --git a/${file.filename} b/${file.filename}\n${file.patch ?? '[no patch: the file diff is too large]'}\n`
        )
        .join(''),
      MAX_DIFF
    )
  } catch (error) {
    return `The diff could not be read: ${errorText(error)}`
  }
}

const FAILED_CONCLUSIONS = [
  'FAILURE',
  'TIMED_OUT',
  'CANCELLED',
  'ACTION_REQUIRED',
  'STARTUP_FAILURE'
]
const MAX_FAILED_CHECKS = 6
const MAX_LOG_EXCERPT = 3000
const LOG_LINES_BEFORE_ERROR = 40

/**
 * The lines of a failed job log that most likely show the cause. GitHub
 * starts the line of a failed step with "##[error]", so the excerpt is the
 * output just before that line. Without the marker, it is the end of the log.
 */
async function logExcerpt(detailsUrl) {
  const jobId = /\/job\/(\d+)/.exec(detailsUrl ?? '')?.[1]
  if (!jobId) {
    return null
  }
  try {
    const lines = (
      await gh([
        'api',
        `repos/${process.env.GITHUB_REPOSITORY}/actions/jobs/${jobId}/logs`
      ])
    )
      .split('\n')
      // Remove the timestamp at the start of each line.
      .map((line) => line.replace(/^\S+Z /, '').trimEnd())
      .filter(Boolean)
    const marker = lines.findIndex((line) => line.startsWith('##[error]'))
    const end = marker === -1 ? lines.length : marker + 3
    const excerpt = lines.slice(Math.max(0, end - LOG_LINES_BEFORE_ERROR), end)
    // Keep the end of the excerpt, which is nearest to the error.
    const text = excerpt.join('\n')
    return text.length > MAX_LOG_EXCERPT
      ? `[truncated]\n${text.slice(-MAX_LOG_EXCERPT)}`
      : text
  } catch (error) {
    return `The log could not be read: ${errorText(error)}`
  }
}

/**
 * The CI result on the PR. When the event starts the prescreen, CI has
 * normally not finished yet. A manual run later sees the result.
 * The checks of this workflow are not CI: they are pending while it runs.
 */
async function collectChecks(statusCheckRollup) {
  const ownWorkflow = process.env.OWN_WORKFLOW
  const checks = statusCheckRollup
    .filter(
      (check) =>
        check.__typename !== 'CheckRun' ||
        !ownWorkflow ||
        check.workflowName !== ownWorkflow
    )
    .map((check) =>
      check.__typename === 'CheckRun'
        ? {
            name: `${check.workflowName} / ${check.name}`,
            done: check.status === 'COMPLETED',
            failed: FAILED_CONCLUSIONS.includes(check.conclusion),
            url: check.detailsUrl
          }
        : {
            name: check.context,
            done: check.state !== 'PENDING' && check.state !== 'EXPECTED',
            failed: check.state === 'FAILURE' || check.state === 'ERROR',
            url: check.targetUrl
          }
    )
  return {
    total: checks.length,
    pending: checks.filter((check) => !check.done).map((check) => check.name),
    failed: await Promise.all(
      checks
        .filter((check) => check.failed)
        .slice(0, MAX_FAILED_CHECKS)
        .map(async (check) => ({
          name: check.name,
          url: check.url,
          logExcerpt: await logExcerpt(check.url)
        }))
    )
  }
}

const pr = await ghJson([
  'pr',
  'view',
  prNumber,
  '--json',
  'number,title,url,author,labels,body,baseRefName,files,statusCheckRollup'
])

const updates = findUpdates(pr.body)
const packages = [...new Set(updates.map((update) => update.package))]

const facts = {
  pr: {
    number: pr.number,
    title: pr.title,
    url: pr.url,
    author: pr.author.login,
    labels: pr.labels.map((label) => label.name),
    baseBranch: pr.baseRefName,
    changedFiles: pr.files.map((file) => file.path)
  },
  updates,
  advisories: await Promise.all(findAdvisoryIds(pr.body).map(fetchAdvisory)),
  packages: await Promise.all(
    packages.map(async (name) => ({
      name,
      npm: await fetchNpmFacts(name, [
        ...new Set(
          updates
            .filter((update) => update.package === name)
            .map((update) => update.to)
        )
      ]),
      usage: findUsage(name)
    }))
  ),
  checks: await collectChecks(pr.statusCheckRollup ?? []),
  manifestDiff: await manifestDiff()
}

console.log(JSON.stringify(facts, null, 2))
