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
import { CLIENT_URL } from './constants'

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
 * Two files, because Playwright's storage state cannot carry everything the
 * app keeps a session in:
 *
 * - `storage-state.json` is Playwright's own storage state (cookies +
 *   localStorage) of the signed-in setup context.
 * - `session.json` holds the PIN, which the app keeps in IndexedDB.
 *
 * Both are written per run into a gitignored directory.
 */
export const AUTH_STATE_DIR = path.resolve(__dirname, '../../playwright/.auth')
export const STORAGE_STATE_FILE = path.join(
  AUTH_STATE_DIR,
  'storage-state.json'
)
export const SESSION_STATE_FILE = path.join(AUTH_STATE_DIR, 'session.json')

/**
 * idb-keyval store the client app keeps its key-value pairs in.
 * Mirrors `packages/client/src/storage.ts`.
 */
const IDB_DATABASE = 'OpenCRVS'
const IDB_STORE = 'keyvaluepairs'
const USER_DATA_KEY = 'USER_DATA'
const USER_DETAILS_KEY = 'USER_DETAILS'

/**
 * localStorage keys the client keeps its tokens in
 * (`packages/client/src/utils/authUtils.ts`). They are deliberately *not*
 * reused across tests: a UI logout invalidates both tokens server-side, so
 * one test logging out would sign every other test out too. Each test mints
 * its own pair - two cheap API calls - and seeds them next to the shared
 * state.
 */
const TOKEN_KEYS = ['opencrvs', 'opencrvs-refresh']

/** Bump when the shape below changes, so stale files are ignored. */
const SESSION_STATE_VERSION = 1

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

interface SharedSession {
  pinHash: string
  /** Non-token localStorage entries of the client origin. */
  localStorage: { name: string; value: string }[]
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

function readUserIdFromToken(token: string) {
  const { sub } = JSON.parse(
    Buffer.from(token.split('.')[1], 'base64').toString()
  ) as { sub: string }

  return sub
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
    localStorage: (
      storageState.origins?.find((entry) => entry.origin === origin)
        ?.localStorage ?? []
    ).filter(({ name }) => !TOKEN_KEYS.includes(name))
  }

  return cachedSession
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

  seedCount += 1

  await page.addInitScript(
    (seed: {
      origin: string
      marker: string
      database: string
      store: string
      localStorage: { name: string; value: string }[]
      records: { key: string; value: string }[]
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

        for (const { key, value } of seed.records) {
          store.put(value, key)
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
      records: [
        // `ProtectedPage` looks the PIN up by the current user's id; the app
        // overwrites both entries with the real ones as soon as it has them.
        { key: USER_DETAILS_KEY, value: JSON.stringify({ id: userId }) },
        {
          key: USER_DATA_KEY,
          value: JSON.stringify([{ userID: userId, userPIN: session.pinHash }])
        }
      ]
    }
  )
}
