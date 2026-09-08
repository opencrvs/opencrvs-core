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
import { expect, Page, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { writeFileSync } from 'node:fs'
import {
  continueForm,
  drawSignature,
  formatName,
  getRandomDate,
  goToSection,
  login,
  searchFromSearchBar,
  switchEventTab,
  triggerDeclarationAction,
  uploadImage
} from '@e2e/support/helpers'
import { CLIENT_URL, CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser } from '@e2e/support/utils'
import {
  mockNetworkConditions,
  restoreNetworkConditions
} from '@e2e/support/mock-network-conditions'

/*
 * Repro attempt for #13618: "Supporting documents and signature intermittently
 * display as broken images in the Record tab."
 *
 * Documents and signatures render from a relative path (`/events/<id>/<file>.png`),
 * which only the service worker's runtime cache can answer — see `toFileUrl` and
 * `src-sw.ts`, where MINIO_REGEX is served CacheFirst. So a broken image means the
 * file was missing from that cache when the <img> was rendered, and because
 * CacheFirst stores whatever the network returned, the SPA shell can end up cached
 * under the image's URL.
 *
 * Two things can empty that cache while the event document itself survives in the
 * IndexedDB-persisted react-query cache:
 *   - `ReadOnlyView`'s cleanup effect, which removes the files whenever the record
 *     is not assigned to the viewer, keyed on [event, assignmentStatus]
 *   - `deleteEventData` on any submitted action
 * Each scenario below is one way of getting into that state.
 */

interface Sample {
  scenario: string
  at: string
  fileImages: { src: string; broken: boolean; cached: string }[]
  otherBroken: string[]
}

const FILE_URL_REGEX = /\/events\/[^?]+\.(png|jpg|jpeg|svg|pdf)(\?.*)?$/i

const samples: Sample[] = []
const cacheProbes: { label: string; entries: string[] }[] = []
const fileResponses: string[] = []

/*
 * For every <img> pointing at a document, whether the browser could decode it and
 * what the service worker cache holds for it — a `text/html` entry is the SPA shell
 * cached under the image's URL.
 */
async function sampleRecordTab(page: Page, scenario: string, at: string) {
  const fileImages = await page.evaluate(async (pattern: string) => {
    const regex = new RegExp(pattern, 'i')
    const images = Array.from(document.querySelectorAll('img'))

    return Promise.all(
      images
        .filter((img) => regex.test(img.currentSrc || img.src))
        .map(async (img) => {
          const src = img.currentSrc || img.src
          const match = await caches.match(src, { ignoreSearch: true })

          return {
            src: new URL(src).pathname,
            broken: !img.complete || img.naturalWidth === 0,
            cached: match
              ? (match.headers.get('content-type') ?? 'no content-type')
              : 'MISS'
          }
        })
    )
  }, FILE_URL_REGEX.source)

  const otherBroken = await page.evaluate((pattern: string) => {
    const regex = new RegExp(pattern, 'i')

    return Array.from(document.querySelectorAll('img'))
      .filter((img) => !regex.test(img.currentSrc || img.src))
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src || '(empty src)')
  }, FILE_URL_REGEX.source)

  samples.push({ scenario, at, fileImages, otherBroken })
  persistSummary()
}

/*
 * Written after every sample rather than at the end of the test, so a scenario that
 * fails or times out still leaves the evidence gathered before it on disk.
 */
function persistSummary() {
  writeFileSync(
    'test-results/ocrvs-13618-summary.json',
    JSON.stringify(
      {
        issue: 13618,
        brokenSamples: samples.filter((sample) =>
          sample.fileImages.some((image) => image.broken)
        ).length,
        totalSamples: samples.length,
        samples,
        cacheProbes,
        fileResponses
      },
      null,
      2
    )
  )
}

/*
 * What the workbox-runtime cache holds for this record's files, read without
 * touching it — evidence of what the app itself put there or removed.
 */
async function probeCache(page: Page, label: string) {
  const entries = await page.evaluate(async (pattern: string) => {
    const regex = new RegExp(pattern, 'i')
    const cacheKey = (await caches.keys()).find((key) =>
      key.includes('workbox-runtime')
    )

    if (!cacheKey) {
      return ['no workbox-runtime cache']
    }

    const cache = await caches.open(cacheKey)
    const requests = (await cache.keys()).filter((request) =>
      regex.test(request.url)
    )

    return Promise.all(
      requests.map(async (request) => {
        const match = await cache.match(request)

        return `${new URL(request.url).pathname.split('/').pop()}: ${
          match?.headers.get('content-type') ?? 'no content-type'
        }`
      })
    )
  }, FILE_URL_REGEX.source)

  cacheProbes.push({ label, entries: entries.length ? entries : ['EMPTY'] })
  persistSummary()
}

/*
 * A freshly registered record takes a moment to reach the search index, so the
 * first search after `Register` can come back empty.
 */
async function openRecordBySearch(page: Page, childName: string) {
  await expect(async () => {
    await page.goto(CLIENT_URL)
    await searchFromSearchBar(page, childName)
  }).toPass({ timeout: 60000 })
}

async function readRecordTab(page: Page, scenario: string, childName: string) {
  await switchEventTab(page, 'Record')
  // A throttled context can take a while to render the record's own fields.
  await expect(page.getByTestId('child.name-value')).toHaveText(childName, {
    timeout: 30000
  })

  await sampleRecordTab(page, scenario, 'immediately')
  await page.waitForTimeout(3000)
  await sampleRecordTab(page, scenario, 'after 3s')
}

/*
 * The numbered scenarios are independent of each other, so a run can ask for a
 * subset (`OCRVS_13618_SCENARIOS=8`) instead of paying for all of them — the
 * declaration is created either way, since every scenario needs a record.
 */
const REQUESTED_SCENARIOS = process.env.OCRVS_13618_SCENARIOS?.split(',').map(
  Number
)

async function scenarioStep(
  number: number,
  title: string,
  body: () => Promise<void>
) {
  if (REQUESTED_SCENARIOS && !REQUESTED_SCENARIOS.includes(number)) {
    return
  }

  await test.step(title, body)
}

function recordFileResponses(page: Page) {
  page.on('response', (response) => {
    if (FILE_URL_REGEX.test(response.url())) {
      fileResponses.push(
        `${response.status()} ${
          response.headers()['content-type'] ?? 'no content-type'
        } ${new URL(response.url()).pathname}`
      )
    }
  })
}

test('Supporting document and signature render in the Record tab (#13618)', async ({
  page,
  browser
}) => {
  // Five form pages, a register action, then the record read back many times.
  test.setTimeout(15 * 60 * 1000)

  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      gender: 'Male',
      birthDate: getRandomDate(0, 200),
      placeOfBirth: 'Health Institution',
      birthLocation: 'Klow Village Hospital'
    },
    informant: {
      relation: 'Mother',
      email: faker.internet.email()
    },
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      birthDate: getRandomDate(22, 200),
      identifier: { type: 'None' },
      address: { province: 'Sulaka', district: 'Irundu', village: 'Xhosa' }
    },
    father: { reason: 'Father is unknown' }
  }

  const childName = formatName(declaration.child.name)

  recordFileResponses(page)
  await login(page, CREDENTIALS.REGISTRAR)

  await test.step('Open a birth declaration', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()

    const eventCreateResponse = page.waitForResponse(
      (res) => res.url().includes('event.create') && res.ok()
    )

    await page.getByRole('button', { name: 'Continue' }).click()
    await eventCreateResponse
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Fill child details', async () => {
    await page.locator('#firstname').fill(declaration.child.name.firstNames)
    await page.locator('#surname').fill(declaration.child.name.familyName)
    await page.locator('#child____gender').click()
    await page.getByText(declaration.child.gender, { exact: true }).click()
    await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
    await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
    await page.getByPlaceholder('yyyy').fill(declaration.child.birthDate.yyyy)
    await page.locator('#child____placeOfBirth').click()
    await page
      .getByText(declaration.child.placeOfBirth, { exact: true })
      .click()
    await page
      .locator('#child____birthLocation')
      .fill(declaration.child.birthLocation.slice(0, 3))
    await page.getByText(declaration.child.birthLocation).click()
    await continueForm(page)
  })

  await test.step('Fill informant details', async () => {
    await page.locator('#informant____relation').click()
    await page
      .getByText(declaration.informant.relation, { exact: true })
      .click()
    await page.locator('#informant____email').fill(declaration.informant.email)
    await continueForm(page)
  })

  await test.step("Fill mother's details", async () => {
    await page.locator('#firstname').fill(declaration.mother.name.firstNames)
    await page.locator('#surname').fill(declaration.mother.name.familyName)
    await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
    await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
    await page.getByPlaceholder('yyyy').fill(declaration.mother.birthDate.yyyy)
    await page.locator('#mother____idType').click()
    await page
      .getByText(declaration.mother.identifier.type, { exact: true })
      .click()
    await page.locator('#province').click()
    await page
      .getByText(declaration.mother.address.province, { exact: true })
      .click()
    await page.locator('#district').click()
    await page
      .getByText(declaration.mother.address.district, { exact: true })
      .click()
    await page.locator('#village').click()
    await page
      .getByText(declaration.mother.address.village, { exact: true })
      .click()
    await continueForm(page)
  })

  await test.step("Fill father's details", async () => {
    await page.getByLabel("Father's details are not available").check()
    await page.locator('#father____reason').fill(declaration.father.reason)
    await continueForm(page)
  })

  await test.step('Attach a supporting document', async () => {
    await goToSection(page, 'documents')

    const upload = page.waitForResponse(
      (res) => res.url().includes('/api/upload') && res.ok()
    )

    await uploadImage(
      page,
      page.locator('button[name="documents____proofOfBirth"]')
    )

    await upload
  })

  await test.step('Sign and register', async () => {
    await goToSection(page, 'review')

    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    await triggerDeclarationAction(page, 'Register')
  })

  /*
   * The session that uploaded the files also cached them: the best case, and the
   * baseline the other scenarios are compared against.
   */
  await scenarioStep(1, '1. Same session, straight after registering', async () => {
    await openRecordBySearch(page, childName)
    await readRecordTab(page, '1. same session after register', childName)
  })

  /*
   * Leaving the Record tab runs `ReadOnlyView`'s cleanup, which removes the files
   * from the cache for a record the viewer is not assigned to. Reading the record
   * again then has to precache them from scratch.
   */
  await scenarioStep(2, '2. Leave the Record tab and read it again', async () => {
    for (let visit = 1; visit <= 3; visit++) {
      await openRecordBySearch(page, childName)
      await readRecordTab(page, `2. re-opened, visit ${visit}`, childName)
    }
  })

  /*
   * A reload renders from the IndexedDB-persisted event document, whose lifetime is
   * independent of the service worker cache the images come from.
   */
  await scenarioStep(3, '3. Reload while on the Record tab', async () => {
    for (let reload = 1; reload <= 3; reload++) {
      await page.reload()
      await readRecordTab(page, `3. after reload ${reload}`, childName)
    }
  })

  /*
   * A reviewer who never held the files locally, on a slow connection: the precache
   * of a 528KB document is no longer instant, so anything rendering before it
   * finishes shows a broken image.
   */
  await scenarioStep(4, '4. Fresh context on a throttled connection', async () => {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const context = await browser.newContext()
      const freshPage = await context.newPage()

      recordFileResponses(freshPage)
      await login(freshPage, CREDENTIALS.REGISTRAR)

      await openRecordBySearch(freshPage, childName)

      /*
       * Throttled from here on only: what is being slowed down is the precache of
       * the document, not getting to the record.
       */
      await mockNetworkConditions(freshPage, 'cellular3G')

      await readRecordTab(
        freshPage,
        `4. fresh 3G context ${attempt}`,
        childName
      )

      await restoreNetworkConditions(freshPage)
      await context.close()
    }
  })

  /*
   * `precacheFile` swallows a failed fetch: `fetchFileFromUrl` returns undefined and
   * nothing is cached, so the <img> falls through to the network, where the client
   * origin answers with the SPA shell — which CacheFirst then stores under the
   * image's own URL. This scenario fails the document's presigned-url lookup once
   * and then restores the network, to see whether the Record tab recovers.
   */
  await scenarioStep(5, '5. Presigned-url lookup fails once', async () => {
    const context = await browser.newContext()
    const failingPage = await context.newPage()

    recordFileResponses(failingPage)
    await login(failingPage, CREDENTIALS.REGISTRAR)

    await failingPage.route('**/api/presigned-url/events/**', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{}'
      })
    })

    await openRecordBySearch(failingPage, childName)
    await readRecordTab(failingPage, '5. presigned lookup failing', childName)

    await failingPage.unroute('**/api/presigned-url/events/**')

    for (let reload = 1; reload <= 2; reload++) {
      await failingPage.reload()
      await readRecordTab(
        failingPage,
        `5. reload ${reload}, network healthy again`,
        childName
      )
    }

    await context.close()
  })

  /*
   * The state both `ReadOnlyView`'s cleanup effect and `deleteEventData` leave behind:
   * the files are gone from the service worker cache while the event document itself
   * survives in the IndexedDB-persisted react-query cache, so nothing precaches them
   * again before the <img> elements render.
   */
  await scenarioStep(6, '6. Files evicted from the cache, event document kept', async () => {
    const context = await browser.newContext()
    const evictedPage = await context.newPage()

    recordFileResponses(evictedPage)
    await login(evictedPage, CREDENTIALS.REGISTRAR)
    await openRecordBySearch(evictedPage, childName)
    await readRecordTab(evictedPage, '6. before eviction', childName)

    const evicted = await evictedPage.evaluate(async (pattern: string) => {
      const regex = new RegExp(pattern, 'i')
      const cacheKey = (await caches.keys()).find((key) =>
        key.includes('workbox-runtime')
      )

      if (!cacheKey) {
        return 'no workbox-runtime cache'
      }

      const cache = await caches.open(cacheKey)
      const requests = await cache.keys()
      const files = requests.filter((request) => regex.test(request.url))

      await Promise.all(
        files.map(async (request) => cache.delete(request, { ignoreSearch: true }))
      )

      return `${files.length} file entries deleted`
    }, FILE_URL_REGEX.source)

    // eslint-disable-next-line no-console
    console.log(`#13618 scenario 6: ${evicted}`)

    // Re-render without refetching the event: leave the Record tab and come back.
    await switchEventTab(evictedPage, 'Summary')
    await readRecordTab(evictedPage, '6. re-rendered after eviction', childName)

    for (let reload = 1; reload <= 2; reload++) {
      await evictedPage.reload()
      await readRecordTab(evictedPage, `6. reload ${reload} after eviction`, childName)
    }

    await context.close()
  })

  /*
   * The `ReadOnlyView` cleanup path, driven entirely through the UI:
   *
   * 1. An unassigned viewer opens the Record tab. The files are precached by the
   *    'view-event' query, and the images render.
   * 2. Leaving the Record tab unmounts `ReadOnlyView`, whose cleanup removes those
   *    files from the cache because the record is not assigned to the viewer.
   * 3. Assigning the record populates the `event.get` cache entry. From then on
   *    `useGetOrDownloadEvent` reads the event from that entry with `queryFn`
   *    stripped and `refetchOnMount: false`, so `cacheFiles` never runs again.
   * 4. Re-opening the Record tab therefore renders <img> elements for files that
   *    are no longer in the cache.
   */
  await scenarioStep(7, '7. ReadOnlyView cleanup, then assign', async () => {
    const context = await browser.newContext()
    const viewerPage = await context.newPage()

    recordFileResponses(viewerPage)
    await login(viewerPage, CREDENTIALS.REGISTRAR)
    await openRecordBySearch(viewerPage, childName)

    await readRecordTab(viewerPage, '7a. unassigned viewer', childName)
    await probeCache(viewerPage, '7a. after reading the Record tab')

    // Unmounts ReadOnlyView while the record is still unassigned.
    await switchEventTab(viewerPage, 'Summary')
    await viewerPage.waitForTimeout(2000)
    await probeCache(viewerPage, '7b. after leaving the Record tab')

    await ensureAssignedToUser(viewerPage, CREDENTIALS.REGISTRAR)
    await probeCache(viewerPage, '7c. after assigning')

    await readRecordTab(viewerPage, '7c. assigned, re-opened Record tab', childName)
    await probeCache(viewerPage, '7c. after re-opening the Record tab')

    await viewerPage.reload()
    await readRecordTab(viewerPage, '7d. assigned, after reload', childName)
    await probeCache(viewerPage, '7d. after reload')

    await context.close()
  })

  /*
   * Chrome's "Cached images and files" clears Cache Storage but leaves IndexedDB
   * alone — they are separate checkboxes — and browser eviction can hit one and
   * not the other too. The persisted `event.get` entry therefore outlives the
   * files it refers to, and `useGetOrDownloadEvent` reads that entry with its
   * `queryFn` stripped and `refetchOnMount: false`, so nothing re-runs
   * `cacheFiles`. Unlike scenario 6 the cache is emptied by the browser rather
   * than by this test.
   */
  await scenarioStep(8, '8. Cache Storage cleared, IndexedDB kept', async () => {
    const context = await browser.newContext()
    const clearedPage = await context.newPage()

    recordFileResponses(clearedPage)

    // Whether anything refetches the event after the files are gone.
    const eventRequests: string[] = []

    clearedPage.on('request', (request) => {
      if (/event\.get|view-event/.test(request.url())) {
        eventRequests.push(new URL(request.url()).pathname)
      }
    })

    await login(clearedPage, CREDENTIALS.REGISTRAR)
    await openRecordBySearch(clearedPage, childName)

    // Assigned to self, so `ReadOnlyView`'s cleanup cannot be what empties the cache.
    await ensureAssignedToUser(clearedPage, CREDENTIALS.REGISTRAR)
    await readRecordTab(
      clearedPage,
      '8. before clearing Cache Storage',
      childName
    )
    await probeCache(clearedPage, '8a. before clearing Cache Storage')

    const cdp = await context.newCDPSession(clearedPage)

    await cdp.send('Storage.clearDataForOrigin', {
      origin: new URL(CLIENT_URL).origin,
      storageTypes: 'cache_storage'
    })

    await probeCache(clearedPage, '8b. after clearing Cache Storage')

    eventRequests.length = 0

    await switchEventTab(clearedPage, 'Summary')
    await readRecordTab(clearedPage, '8. re-rendered after clearing', childName)

    for (let reload = 1; reload <= 2; reload++) {
      await clearedPage.reload()
      await readRecordTab(
        clearedPage,
        `8. reload ${reload} after clearing`,
        childName
      )
    }

    await probeCache(clearedPage, '8c. after two reloads')

    // eslint-disable-next-line no-console
    console.log(
      `#13618 scenario 8, event requests after the clear: ${JSON.stringify(
        eventRequests
      )}`
    )

    await context.close()
  })

  const failing = samples.filter((sample) =>
    sample.fileImages.some((image) => image.broken)
  )

  persistSummary()

  // Guards against a vacuous pass: the Record tab must show the files at all.
  expect(
    samples.filter((sample) => sample.fileImages.length > 0).length
  ).toBeGreaterThan(0)

  expect(failing.map((sample) => `${sample.scenario} (${sample.at})`)).toEqual(
    []
  )
})
