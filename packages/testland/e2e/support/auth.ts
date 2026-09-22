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
import { Page, expect } from '@playwright/test'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync
} from 'fs'
import * as path from 'path'
import { createClient } from '@opencrvs/toolkit/api'
import { CLIENT_URL, GATEWAY_HOST } from './constants'

/**
 * Shared authentication state, following Playwright's authentication guide
 * (https://playwright.dev/docs/auth).
 *
 * The `setup` project signs in once, walks the PIN screen once and persists
 * the resulting browser state here. Every `login()` afterwards seeds that
 * state into the browser, so the app boots already authenticated and
 * unlocked instead of replaying the sign-in handoff and the PIN screen in
 * every spec.
 *
 * Three files, because Playwright's storage state cannot carry everything the
 * app keeps a session in:
 *
 * - `storage-state.json` is Playwright's own storage state (cookies +
 *   localStorage) of the signed-in setup context.
 * - `session.json` holds the PIN, which the app keeps in IndexedDB.
 * - `offline.json` holds the country-config cache the app boots on, which it
 *   also keeps in IndexedDB. See `captureOfflineData` below.
 *
 * All three are written per run into a gitignored directory.
 */
export const AUTH_STATE_DIR = path.resolve(__dirname, '../../playwright/.auth')
export const STORAGE_STATE_FILE = path.join(
  AUTH_STATE_DIR,
  'storage-state.json'
)
export const SESSION_STATE_FILE = path.join(AUTH_STATE_DIR, 'session.json')
export const OFFLINE_STATE_FILE = path.join(AUTH_STATE_DIR, 'offline.json')

/**
 * idb-keyval store the client app keeps its key-value pairs in.
 * Mirrors `packages/client/src/storage.ts`.
 */
const IDB_DATABASE = 'OpenCRVS'
const IDB_STORE = 'keyvaluepairs'
const USER_DATA_KEY = 'USER_DATA'
const USER_DETAILS_KEY = 'USER_DETAILS'
/** Key the client caches the country configuration under, see `saveOfflineData`. */
const OFFLINE_KEY = 'offline'

/**
 * The one scope `/api/config` varies its response by: the gateway filters the
 * certificate templates it returns down to the templates this scope allows
 * (`configHandler.getCertificatesConfig`). Nothing else in the cache depends
 * on who asked for it.
 */
const CERTIFICATE_SCOPE_PREFIX = 'record.print-certified-copies'

/**
 * localStorage keys the client keeps its tokens in
 * (`packages/client/src/utils/authUtils.ts`). They are deliberately *not*
 * reused across tests: a UI logout invalidates both tokens server-side, so
 * one test logging out would sign every other test out too. Each test mints
 * its own pair - two cheap API calls - and seeds them next to the shared
 * state.
 */
const TOKEN_KEYS = ['opencrvs', 'opencrvs-refresh']

/** Bump when the shapes below change, so stale files are ignored. */
const SESSION_STATE_VERSION = 2

interface PersistedSession {
  version: number
  /** Client origin the state was captured against. */
  origin: string
  /**
   * bcrypt hash of the PIN `createPIN` types. The hash depends on the PIN
   * only, not on the user, so the same hash unlocks the app for every test
   * user - the app just looks it up by user id.
   */
  pinHash: string
}

/**
 * The client's own `offline` cache entry, as captured from the setup user.
 *
 * `offlineData` is the parsed entry. It is stored parsed rather than as the
 * raw string so the per-role part can be dropped before seeding - see
 * `offlineDataForToken`.
 */
interface PersistedOfflineData {
  version: number
  /** Client origin the cache was captured against. */
  origin: string
  /**
   * The capturing user's `record.print-certified-copies` scopes, sorted. A
   * user whose scopes match gets the captured certificates as they are,
   * because `/api/config` would return exactly those to them too.
   */
  certificateScopes: string[]
  offlineData: OfflineData
}

type OfflineData = {
  config?: unknown
  languages?: unknown
  templates?: { certificates?: unknown[] }
} & Record<string, unknown>

interface SharedSession {
  pinHash: string
  /** Non-token localStorage entries of the client origin. */
  localStorage: { name: string; value: string }[]
  /** `null` when the country-config cache could not be captured. */
  offline: PersistedOfflineData | null
}

/** Per-worker cache so every `login()` does not re-read the files. */
let cachedSession: SharedSession | null = null

const clientOrigin = () => new URL(CLIENT_URL).origin

/** Reads a string entry out of the app's idb-keyval store. */
function readStoredString(page: Page, key: string) {
  return page.evaluate(
    ({ database, store, key }) =>
      new Promise<string | null>((resolve, reject) => {
        const open = indexedDB.open(database)
        open.onerror = () => reject(open.error)
        open.onsuccess = () => {
          const db = open.result
          if (!db.objectStoreNames.contains(store)) {
            db.close()
            resolve(null)
            return
          }
          const request = db
            .transaction(store, 'readonly')
            .objectStore(store)
            .get(key)
          request.onerror = () => {
            db.close()
            reject(request.error)
          }
          request.onsuccess = () => {
            db.close()
            resolve((request.result as string | undefined) ?? null)
          }
        }
      }),
    { database: IDB_DATABASE, store: IDB_STORE, key }
  )
}

function readTokenPayload(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) as {
    sub: string
    scope?: string[]
  }
}

/**
 * The token's certificate scopes, sorted so two users can be compared.
 * Kept as the raw scope strings - they carry the allowed template ids - so
 * this does not have to know how a configurable scope is encoded.
 */
function readCertificateScopes(token: string) {
  return (readTokenPayload(token).scope ?? [])
    .filter((scope) => scope.startsWith(CERTIFICATE_SCOPE_PREFIX))
    .sort()
}

function readUserIdFromToken(token: string) {
  return readTokenPayload(token).sub
}

async function readPinHash(page: Page, userId: string) {
  const userData = await readStoredString(page, USER_DATA_KEY)

  if (!userData) {
    return null
  }

  const allUserData = JSON.parse(userData) as {
    userID: string
    userPIN?: string
  }[]

  return allUserData.find(({ userID }) => userID === userId)?.userPIN ?? null
}

/**
 * The signing-in user's record, exactly as the app itself caches it under
 * `USER_DETAILS`.
 *
 * `USER_DETAILS` cannot be left out of the seed: `ProtectedPage.getPIN()`
 * looks the PIN up by `getCurrentUserID()`, which reads the id from this very
 * entry, so without it the app shows the create-PIN screen.
 *
 * It must not be a stub either. `profileReducer`'s `GET_USER_DETAILS_SUCCESS`
 * treats a cached record whose id matches the token's `sub` as usable and
 * renders the app from it straight away - "so offline data loading is not
 * delayed" - while it refetches in the background. A stub would therefore let
 * the app run, briefly, with a user that has no name, no role and no primary
 * office.
 *
 * So fetch the real record from the same `user.get` procedure the client
 * calls (`packages/client/src/profile/queries.ts`), and seed that. What the
 * background refetch returns is then what is already there.
 */
async function fetchUserDetails(token: string, userId: string) {
  const client = createClient(`${GATEWAY_HOST}/events`, `Bearer ${token}`)

  return client.user.get.query(userId)
}

/**
 * Mirrors the client's `isOfflineDataLoaded` (`offline/selectors.ts`): the
 * three keys it needs before it renders anything but the loading bar.
 */
function hasRequiredOfflineData(data: OfflineData) {
  return Boolean(data.config && data.templates && data.languages)
}

/**
 * The country configuration the client caches under `offline`.
 *
 * On every boot the app blocks on this: `Page` renders a loading bar until
 * `offlineDataLoaded` is true, and that only happens once `/api/config` (plus
 * every certificate font it downloads), the country config's `content/client`
 * and its handlebars module have all resolved. With the cache already in
 * IndexedDB the app instead takes the branch it takes on any second boot -
 * render from the cache straight away and refresh in the background
 * (`GET_OFFLINE_DATA_SUCCESS`) - which is what this captures it for.
 *
 * Best effort: the cache is an optimisation, so a failure here leaves
 * `offline.json` unwritten and every login boots the slow way, exactly as
 * before.
 */
async function captureOfflineData(page: Page, token: string) {
  let raw: string | null = null

  try {
    // Written asynchronously once the app has finished loading the config.
    await expect(async () => {
      const stored = await readStoredString(page, OFFLINE_KEY)
      expect(
        Boolean(stored && hasRequiredOfflineData(JSON.parse(stored)))
      ).toBe(true)
      raw = stored
    }).toPass({ timeout: 30_000 })
  } catch {
    return
  }

  if (!raw) {
    return
  }

  const captured: PersistedOfflineData = {
    version: SESSION_STATE_VERSION,
    origin: clientOrigin(),
    certificateScopes: readCertificateScopes(token),
    offlineData: JSON.parse(raw) as OfflineData
  }

  writeJsonAtomically(OFFLINE_STATE_FILE, captured)
}

/**
 * What to seed into `offline` for the user behind `token`.
 *
 * Everything in the cache is country-wide - the client itself keeps it under
 * one key for all users, so on a shared browser the next user already boots
 * on the previous user's copy - with one exception: `/api/config` filters
 * `templates.certificates` by the caller's `record.print-certified-copies`
 * scope. Seeding the setup user's certificates for a user with different
 * scopes would show them templates the gateway would not have given them,
 * so those are dropped and left to the background refresh, which fills them
 * in at the same moment it does today.
 */
function offlineDataForToken(
  offline: PersistedOfflineData,
  token: string
): string {
  const sameScopes =
    JSON.stringify(readCertificateScopes(token)) ===
    JSON.stringify(offline.certificateScopes)

  if (sameScopes) {
    return JSON.stringify(offline.offlineData)
  }

  return JSON.stringify({
    ...offline.offlineData,
    // `templates` must stay an object: the app treats a cache without it as
    // not loaded and blocks on the network again.
    templates: { ...offline.offlineData.templates, certificates: [] }
  })
}

/** Writes JSON so a parallel worker never reads a half-written file. */
function writeJsonAtomically(filePath: string, contents: unknown) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`
  writeFileSync(temporaryPath, `${JSON.stringify(contents, null, 2)}\n`)
  renameSync(temporaryPath, filePath)
}

/**
 * Captures the session of a page that has just signed in and created its PIN,
 * so the rest of the run can reuse it.
 */
export async function captureSharedSession(page: Page, token: string) {
  const userId = readUserIdFromToken(token)

  let pinHash: string | null = null

  // The PIN is written asynchronously once the last digit is typed.
  await expect(async () => {
    pinHash = await readPinHash(page, userId)
    expect(pinHash).toBeTruthy()
  }).toPass({ timeout: 20_000 })

  if (!pinHash) {
    throw new Error('Could not read the PIN of the signed-in setup user')
  }

  mkdirSync(AUTH_STATE_DIR, { recursive: true })

  await page.context().storageState({ path: STORAGE_STATE_FILE })

  const session: PersistedSession = {
    version: SESSION_STATE_VERSION,
    origin: clientOrigin(),
    pinHash
  }

  writeJsonAtomically(SESSION_STATE_FILE, session)

  await captureOfflineData(page, token)

  cachedSession = null
}

/** Set once a worker has tried to capture the session itself. */
let captureAttempted = false

/**
 * Captures the session unless it is already on disk, so a run that never
 * executes the `setup` project - Playwright applies file filters to every
 * project, including setup ones - still only signs in the slow way once.
 *
 * Best effort: a failure here must not fail the test that happened to be
 * first, it only means the next one signs in the slow way too.
 */
export async function captureSharedSessionOnce(page: Page, token: string) {
  if (captureAttempted || readSharedSession()) {
    return
  }

  captureAttempted = true

  try {
    await captureSharedSession(page, token)
  } catch {
    captureAttempted = false
  }
}

/**
 * The shared session, or `null` when it has not been captured yet - in which
 * case `login()` falls back to signing in through the app.
 */
export function readSharedSession(): SharedSession | null {
  if (cachedSession) {
    return cachedSession
  }

  if (!existsSync(SESSION_STATE_FILE) || !existsSync(STORAGE_STATE_FILE)) {
    return null
  }

  let session: PersistedSession
  let storageState: {
    origins?: {
      origin: string
      localStorage: { name: string; value: string }[]
    }[]
  }

  try {
    session = JSON.parse(
      readFileSync(SESSION_STATE_FILE, 'utf8')
    ) as PersistedSession
    storageState = JSON.parse(readFileSync(STORAGE_STATE_FILE, 'utf8'))
  } catch {
    // A file written by a run that died halfway. Sign in the slow way.
    return null
  }

  const origin = clientOrigin()

  if (
    session.version !== SESSION_STATE_VERSION ||
    session.origin !== origin ||
    !session.pinHash
  ) {
    return null
  }

  cachedSession = {
    pinHash: session.pinHash,
    offline: readPersistedOfflineData(origin),
    localStorage: (
      storageState.origins?.find((entry) => entry.origin === origin)
        ?.localStorage ?? []
    ).filter(({ name }) => !TOKEN_KEYS.includes(name))
  }

  return cachedSession
}

/**
 * The captured country-config cache, or `null` when there is none to seed -
 * in which case the app loads it from the network as it always has.
 */
function readPersistedOfflineData(origin: string): PersistedOfflineData | null {
  if (!existsSync(OFFLINE_STATE_FILE)) {
    return null
  }

  let offline: PersistedOfflineData

  try {
    offline = JSON.parse(
      readFileSync(OFFLINE_STATE_FILE, 'utf8')
    ) as PersistedOfflineData
  } catch {
    return null
  }

  if (
    offline.version !== SESSION_STATE_VERSION ||
    offline.origin !== origin ||
    !offline.offlineData ||
    !hasRequiredOfflineData(offline.offlineData)
  ) {
    return null
  }

  return offline
}

/**
 * Number of sessions seeded by this worker, used to give each seed its own
 * one-shot marker. Without it the init script would sign the user back in
 * after a test logs out on purpose.
 */
let seedCount = 0

/**
 * Seeds an authenticated, unlocked session into the browser before the app
 * boots. Playwright's `storageState` can only be handed to a new context, so
 * the state is applied with `page.addInitScript` instead - the same approach
 * the Playwright docs use for storage `storageState` does not cover.
 */
export async function seedSharedSession(
  page: Page,
  {
    token,
    refreshToken,
    session
  }: { token: string; refreshToken: string; session: SharedSession }
) {
  const userId = readUserIdFromToken(token)
  const userDetails = JSON.stringify(await fetchUserDetails(token, userId))
  const offlineData = session.offline
    ? offlineDataForToken(session.offline, token)
    : null

  seedCount += 1

  await page.addInitScript(
    (seed: {
      origin: string
      marker: string
      database: string
      store: string
      localStorage: { name: string; value: string }[]
      userDetailsKey: string
      userDataKey: string
      offlineKey: string
      userId: string
      userDetails: string
      offlineData: string | null
      pinHash: string
    }) => {
      if (window.location.origin !== seed.origin) {
        return
      }

      // Seed once per tab: a test that logs out must stay logged out.
      try {
        if (window.sessionStorage.getItem(seed.marker)) {
          return
        }
        window.sessionStorage.setItem(seed.marker, 'seeded')
      } catch {
        return
      }

      for (const { name, value } of seed.localStorage) {
        window.localStorage.setItem(name, value)
      }

      // idb-keyval opens the database at version 1 and creates the store in
      // its upgrade handler; do exactly the same so whichever of the two runs
      // first leaves a store the other can use.
      const open = indexedDB.open(seed.database, 1)

      open.onupgradeneeded = () => {
        if (!open.result.objectStoreNames.contains(seed.store)) {
          open.result.createObjectStore(seed.store)
        }
      }

      open.onsuccess = () => {
        const db = open.result

        if (!db.objectStoreNames.contains(seed.store)) {
          db.close()
          return
        }

        const transaction = db.transaction(seed.store, 'readwrite')
        const store = transaction.objectStore(seed.store)

        store.put(seed.userDetails, seed.userDetailsKey)

        /*
         * The country configuration, so the app boots from the cache instead
         * of blocking on the network for it. Written in the same transaction
         * as the rest: IndexedDB runs transactions on a store in the order
         * they were created, so the app's own read of this key - issued from
         * its own, later transaction - waits for this one to commit.
         */
        if (seed.offlineData) {
          store.put(seed.offlineData, seed.offlineKey)
        }

        /*
         * Merge the PIN into whatever the store already holds. The app keeps
         * one entry per user in `USER_DATA` and, unlike `USER_DETAILS`, never
         * clears it on logout - so a test that signs a second user in on the
         * same page would otherwise drop the first user's PIN, and the app
         * would show that user the create-PIN screen when they sign back in.
         * Mirrors `storePINForUser` in the client's `CreatePin`.
         */
        const stored = store.get(seed.userDataKey)

        stored.onsuccess = () => {
          let allUserData: { userID: string; userPIN?: string }[] = []

          try {
            const parsed = JSON.parse((stored.result as string) || '[]')
            if (Array.isArray(parsed)) {
              allUserData = parsed
            }
          } catch {
            allUserData = []
          }

          const currentUserData = allUserData.find(
            (user) => user && user.userID === seed.userId
          )

          if (currentUserData) {
            currentUserData.userPIN = seed.pinHash
          } else {
            allUserData.push({ userID: seed.userId, userPIN: seed.pinHash })
          }

          store.put(JSON.stringify(allUserData), seed.userDataKey)
        }

        transaction.oncomplete = () => db.close()
      }
    },
    {
      origin: clientOrigin(),
      marker: `opencrvs-e2e-shared-session-${seedCount}`,
      database: IDB_DATABASE,
      store: IDB_STORE,
      localStorage: [
        ...session.localStorage,
        { name: 'opencrvs', value: token },
        { name: 'opencrvs-refresh', value: refreshToken }
      ],
      // `ProtectedPage` looks the PIN up by the current user's id, which it
      // reads out of `USER_DETAILS` - see `fetchUserDetails` above.
      userDetailsKey: USER_DETAILS_KEY,
      userDataKey: USER_DATA_KEY,
      offlineKey: OFFLINE_KEY,
      userId,
      userDetails,
      offlineData,
      pinHash: session.pinHash
    }
  )
}
