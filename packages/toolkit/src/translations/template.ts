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
 * Reads the country config template's translation files off GitHub.
 *
 * The template is the record of the copy core requires: a pull request that
 * introduces a translation key has to add it to
 * `packages/countryconfig-template/src/translations/`, which the
 * check-missing-translation workflow makes it do anyway. Two things read it —
 * the `add-translations` codemod, which adds the new rows to a country config's
 * own files, and `verify-endpoints`, which checks a running country config
 * actually serves them — so the ref resolution lives here rather than in
 * either.
 */

const REPOSITORY = 'opencrvs/opencrvs-core'
const TEMPLATE_TRANSLATIONS = 'packages/countryconfig-template/src/translations'

/**
 * The refs matching a prefix, newest patch first.
 *
 * Every patch gets its own release branch — `release/2.1.0`, `release/2.1.1` —
 * and a translation key added in a patch only exists on that patch's branch, so
 * the newest one is the one worth reading.
 */
async function matchingRefs(namespace: string, prefix: string) {
  const url = `https://api.github.com/repos/${REPOSITORY}/git/matching-refs/${namespace}/${prefix}`

  const response = await fetch(url, {
    headers: { accept: 'application/vnd.github+json' }
  })

  /*
   * An empty list and a failed request are not the same thing: GitHub answers
   * 200 with `[]` for a prefix nothing matches, so anything else is the request
   * failing rather than the version having no release branch. Swallowing it
   * would leave `develop` as the only candidate left, and an unauthenticated
   * api.github.com allows 60 requests an hour per IP — a country upgrading from
   * a shared network or a CI runner would quietly get unreleased copy.
   */
  if (!response.ok) {
    throw new Error(
      `GitHub answered ${response.status} ${response.statusText} for ${url}`
    )
  }

  const refs = (await response.json()) as Array<{ ref: string }>

  const patchOf = (ref: string) => Number(ref.split('.').pop()) || 0

  return refs
    .map(({ ref }) => ref.replace(/^refs\/(heads|tags)\//, ''))
    .sort((a, b) => patchOf(b) - patchOf(a))
}

/**
 * Where to read the template from, most specific first: the newest release
 * branch of the given version, then its newest tag, then `develop` for anyone
 * running before the version has been cut.
 */
export async function candidateRefs(version: string) {
  return [
    ...(await matchingRefs('heads', `release/${version}.`)),
    ...(await matchingRefs('tags', `v${version}.`)),
    'develop'
  ]
}

export async function fetchTemplate(refs: string[], application: string) {
  for (const ref of refs) {
    const url = `https://raw.githubusercontent.com/${REPOSITORY}/${ref}/${TEMPLATE_TRANSLATIONS}/${application}.csv`
    const response = await fetch(url)

    if (response.ok) {
      return { ref, contents: await response.text() }
    }

    // 404 means this ref does not carry the file and the next one is worth a
    // try. Anything else is the request failing, and moving on would read the
    // template from a ref older than the one that was asked for.
    if (response.status !== 404) {
      throw new Error(
        `GitHub answered ${response.status} ${response.statusText} for ${url}`
      )
    }
  }

  return undefined
}
