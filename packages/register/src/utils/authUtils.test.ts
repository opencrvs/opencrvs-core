import { getTokenPayload } from './authUtils'

describe('authUtils tests', () => {
  describe('getAuthorizedToken', () => {
    beforeEach(() => {
      const storage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn()
      }
      ;(window as any).localStorage = storage
    })
    describe('when token is in local storage', () => {
      describe("when it's expired", () => {
        const token =
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUzMTYsImV4cCI6MTUzMzE5NTIxNiwiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.sibbska3KxUIR4Tm6X3wBcRj8YwvJM_hxNe7BwC0Wqn--0jiIuS8Eehsvpfani1jNbyjkO9lJhXmYpysfqje_XvE-XsAaED9EhuNMmjrsCxjy-H4aviufnH5Ek0pWjApG9Ku5IywyMugnNYFMm0rcZYLhbupoYA7iuHvSUsZvkG82FzMVTT-PBZUYAd5pmxBLFEDGfjr0XCL_CzX_jmAGLypyiIdMkvS5XxmN7V_PG0shVu2BLIBc2YcinGQHDltpPbJwsTTe3BUG1XEpK9TfBtuVJDabK-YjhIfOloI6rWBNpdbcAxoQ3IC04Jwhh09wbbD731y0xw7tRh-hXaCzChBCCqk2LJFiCnlxu0an_2oturbAmKOGxShplr_zvZrGkqw4r7QoPX3OEvtYLa4RJhozc1mhnmZ_PmW14FZv-v-pDhML7XQ3nffng0REE8GjWNSAMOAn4Ig5DKA0fJKxXv5BqmOLILGmRsdv28WLv1b3jXFtkNp3gNT4EYPQrqGncC93tdpAtjaohcBfKr_ZO-U8BlpF7XkWXbFWZyMwni0AIR4sjs5eOX1K7AGK3ig5y3xWdBnzHCYUvtrDqg0GMEAjhYCKoU6vc21I1ihJwYrLSRUDuUe_iTzaowrsEYknNIhrIWqMDPC3tI-2PVkXZqk7driKyB74jmQIvceTRg'

        beforeEach(() => {
          ;(window.localStorage.getItem as jest.Mock).mockReturnValue(token)
        })
        it('returns null', () => {
          expect(getTokenPayload()).toBe(null)
        })
        it('removes stored token', () => {
          getTokenPayload()
          expect(localStorage.removeItem).toHaveBeenCalled()
        })
      })

      describe("when it's valid", () => {
        const token =
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

        beforeEach(() => {
          ;(window.localStorage.getItem as jest.Mock).mockReturnValue(token)
        })

        it('returns the token', () => {
          expect(getTokenPayload()).toMatchSnapshot()
        })
        it('stores the token to localStorage', () => {
          getTokenPayload()
          expect(localStorage.setItem).toHaveBeenCalledWith('opencrvs', token)
        })
      })

      describe("when it's invalid", () => {
        const token =
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjosiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjso'

        beforeEach(() => {
          ;(window.localStorage.getItem as jest.Mock).mockReturnValue(token)
        })

        it('returns null', () => {
          expect(getTokenPayload()).toBe(null)
        })
      })
    })

    describe('when token is in url', () => {
      afterEach(() => {
        history.replaceState({}, '', '/')
      })
      describe("when it's valid", () => {
        const token =
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

        beforeEach(() => {
          history.replaceState({}, '', '?token=' + token)
        })

        it('returns the token', () => {
          expect(getTokenPayload()).toMatchSnapshot()
        })
        it('stores the token to localStorage', () => {
          getTokenPayload()
          expect(localStorage.setItem).toHaveBeenCalledWith('opencrvs', token)
        })
      })

      describe("when it's invalid", () => {
        const token =
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjosiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjso'

        beforeEach(() => {
          history.replaceState({}, '', '?token=' + token)
        })

        it('returns null', () => {
          expect(getTokenPayload()).toBe(null)
        })
      })

      describe("when it's expired", () => {
        const token =
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUzMTYsImV4cCI6MTUzMzE5NTIxNiwiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.sibbska3KxUIR4Tm6X3wBcRj8YwvJM_hxNe7BwC0Wqn--0jiIuS8Eehsvpfani1jNbyjkO9lJhXmYpysfqje_XvE-XsAaED9EhuNMmjrsCxjy-H4aviufnH5Ek0pWjApG9Ku5IywyMugnNYFMm0rcZYLhbupoYA7iuHvSUsZvkG82FzMVTT-PBZUYAd5pmxBLFEDGfjr0XCL_CzX_jmAGLypyiIdMkvS5XxmN7V_PG0shVu2BLIBc2YcinGQHDltpPbJwsTTe3BUG1XEpK9TfBtuVJDabK-YjhIfOloI6rWBNpdbcAxoQ3IC04Jwhh09wbbD731y0xw7tRh-hXaCzChBCCqk2LJFiCnlxu0an_2oturbAmKOGxShplr_zvZrGkqw4r7QoPX3OEvtYLa4RJhozc1mhnmZ_PmW14FZv-v-pDhML7XQ3nffng0REE8GjWNSAMOAn4Ig5DKA0fJKxXv5BqmOLILGmRsdv28WLv1b3jXFtkNp3gNT4EYPQrqGncC93tdpAtjaohcBfKr_ZO-U8BlpF7XkWXbFWZyMwni0AIR4sjs5eOX1K7AGK3ig5y3xWdBnzHCYUvtrDqg0GMEAjhYCKoU6vc21I1ihJwYrLSRUDuUe_iTzaowrsEYknNIhrIWqMDPC3tI-2PVkXZqk7driKyB74jmQIvceTRg'

        beforeEach(() => {
          history.replaceState({}, '', '?token=' + token)
        })

        it('returns null', () => {
          expect(getTokenPayload()).toBe(null)
        })
        it('removes stored token', () => {
          getTokenPayload()
          expect(localStorage.removeItem).toHaveBeenCalled()
        })
      })
    })
  })
})
