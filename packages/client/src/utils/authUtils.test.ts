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
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock
} from 'vitest'
import {
  ensureFreshAccessToken,
  getToken,
  getTokenPayload,
  storeRefreshToken,
  storeToken
} from './authUtils'

function makeJwt(expSecondsFromNow: number) {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: '1',
      exp: Math.floor(Date.now() / 1000) + expSecondsFromNow
    })
  )
  return `${header}.${payload}.sig`
}

/**
 * setupTests.ts globally stubs localStorage with vi.fn() mocks that don't
 * actually store data. Replace them with a real in-memory store for these tests.
 */
function makeRealLocalStorage() {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k])
    }
  }
}

describe('ensureFreshAccessToken', () => {
  // vitest 0.25.5: vi.unstubAllGlobals not available; restore originals manually
  const originalFetch = globalThis.fetch
  const originalLocation = globalThis.location

  beforeEach(() => {
    vi.stubGlobal('localStorage', makeRealLocalStorage())
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    if (originalLocation !== undefined) {
      globalThis.location = originalLocation
    }
  })

  it('does nothing when the access token is still fresh', async () => {
    storeToken(makeJwt(60 * 60))
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    await ensureFreshAccessToken()

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('refreshes and stores a new access token when expired', async () => {
    storeToken(makeJwt(-10))
    storeRefreshToken(makeJwt(60 * 60 * 24))
    const newToken = makeJwt(60 * 60)
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: newToken })
    })
    vi.stubGlobal('fetch', fetchSpy)

    await ensureFreshAccessToken()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(getToken()).toBe(newToken)
  })

  it('dedupes concurrent callers into a single refresh (single-flight)', async () => {
    storeToken(makeJwt(-10))
    storeRefreshToken(makeJwt(60 * 60 * 24))
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: makeJwt(60 * 60) })
    })
    vi.stubGlobal('fetch', fetchSpy)

    await Promise.all([
      ensureFreshAccessToken(),
      ensureFreshAccessToken(),
      ensureFreshAccessToken()
    ])

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('redirects to /login when refresh fails', async () => {
    storeToken(makeJwt(-10))
    storeRefreshToken(makeJwt(60 * 60 * 24))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const assign = vi.fn()
    vi.stubGlobal('location', { assign } as unknown as Location)

    await expect(ensureFreshAccessToken()).rejects.toThrow()
    expect(assign).toHaveBeenCalledWith('/login')
    expect(localStorage.getItem('opencrvs')).toBeNull()
    expect(localStorage.getItem('opencrvs-refresh')).toBeNull()
  })
})

describe('authUtils tests', () => {
  describe('getAuthorizedToken', () => {
    beforeEach(() => {
      const storage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn()
      }
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      ;(window as any).localStorage = storage
    })

    afterEach(() => {
      window.history.replaceState({}, '', '/')
    })

    describe('when token is in local storage', () => {
      describe("when it's valid", () => {
        const token =
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

        beforeEach(() => {
          ;(window.localStorage.getItem as Mock).mockReturnValue(token)
        })

        it('returns the token', () => {
          expect(getTokenPayload(getToken())).toMatchSnapshot()
        })
      })

      describe("when it's invalid", () => {
        const token =
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjosiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjso'

        beforeEach(() => {
          ;(window.localStorage.getItem as Mock).mockReturnValue(token)
        })

        it('returns null', () => {
          expect(getTokenPayload(getToken())).toBe(null)
        })
      })
    })

    describe('when token is in url', () => {
      describe("when it's valid", () => {
        const token =
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

        beforeEach(() => {
          window.history.replaceState({}, '', '?token=' + token)
        })

        it('returns the token', () => {
          expect(getTokenPayload(getToken())).toMatchSnapshot()
        })
      })

      describe("when it's invalid", () => {
        const token =
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjosiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjso'

        beforeEach(() => {
          window.history.replaceState({}, '', '?token=' + token)
        })

        it('returns null', () => {
          expect(getTokenPayload(getToken())).toBe(null)
        })
      })
    })
  })
})
