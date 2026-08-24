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
import * as routes from '@login/navigation/routes'
import { createTestApp, flushPromises, waitFor } from '@login/tests/util'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { ReactWrapper } from 'enzyme'
import { createMemoryRouter } from 'react-router-dom'

const server = setupServer(
  rest.get('/api/countryconfig/content/login', (req, res, ctx) => {
    return res(
      ctx.json({
        languages: [
          {
            lang: 'en',
            displayName: 'Français',
            messages: {
              defaultMessage: 'Bangladesh'
            }
          }
        ]
      })
    )
  }),
  rest.get('/api/publicConfig', (req, res, ctx) => {
    return res(
      ctx.json({
        config: {
          APPLICATION_NAME: 'Dummy App',
          COUNTRY: 'FAR',
          COUNTRY_LOGO: {
            fileName: 'dummy-file-name',
            file: 'dummy-logo'
          },
          SENTRY: ''
        }
      })
    )
  })
)

beforeAll(() => {
  server.listen()
})

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

describe('Recovery link landing page', () => {
  let app: ReactWrapper
  let router: ReturnType<typeof createMemoryRouter>

  describe('given a valid, unused token', () => {
    beforeEach(async () => {
      server.use(
        rest.post('/api/auth/verifyRecoveryToken', (req, res, ctx) => {
          return res(
            ctx.json({
              nonce: 'KkcVYTRVC6usF7Vjdi3FSw==',
              securityQuestionKey: 'FAVORITE_MOVIE',
              retrieveFlow: 'password'
            })
          )
        })
      )

      const testApp = await createTestApp({
        initialEntries: [`${routes.RECOVERY_LINK_LANDING}?token=good-token`]
      })
      app = testApp.app
      router = testApp.router
      app.update()

      await flushPromises()
      app.update()
      await waitFor(() =>
        router.state.location.pathname.includes(routes.SECURITY_QUESTION)
      )
    })

    it('navigates to the security question step carrying the exchanged nonce, security question and retrieve flow', () => {
      expect(router.state.location.pathname).toContain(
        routes.SECURITY_QUESTION
      )
      expect(router.state.location.state).toEqual({
        nonce: 'KkcVYTRVC6usF7Vjdi3FSw==',
        securityQuestionKey: 'FAVORITE_MOVIE',
        forgottenItem: 'password'
      })
    })

    it('replaces the tokened URL in history instead of pushing a new entry', () => {
      // replace: true is required so the single-use link cannot be
      // recovered from the back button or browser history.
      expect(router.state.historyAction).toBe('REPLACE')
    })
  })

  describe('given an expired, used, or bogus token', () => {
    beforeEach(async () => {
      server.use(
        rest.post('/api/auth/verifyRecoveryToken', (req, res, ctx) => {
          return res(ctx.status(401))
        })
      )

      const testApp = await createTestApp({
        initialEntries: [`${routes.RECOVERY_LINK_LANDING}?token=bad-token`]
      })
      app = testApp.app
      router = testApp.router
      app.update()

      await flushPromises()
      app.update()
    })

    it('does not navigate to the security question step', () => {
      expect(router.state.location.pathname).not.toContain(
        routes.SECURITY_QUESTION
      )
    })

    it('renders an expired-link message that does not reveal whether the account exists', () => {
      expect(app.text()).toContain('This link is no longer valid')
      expect(app.text().toLowerCase()).not.toContain('account')
    })

    it('offers a link back to the forgotten item form', () => {
      app.find('#recovery-link-expired-restart').hostNodes().simulate('click')
      expect(router.state.location.pathname).toContain(routes.FORGOTTEN_ITEM)
    })
  })

  describe('given a second recovery link is opened while already on this page', () => {
    it('exchanges the new token instead of leaving the first token\'s stale outcome on screen', async () => {
      server.use(
        rest.post('/api/auth/verifyRecoveryToken', (req, res, ctx) => {
          return res(ctx.status(401))
        })
      )

      const testApp = await createTestApp({
        initialEntries: [`${routes.RECOVERY_LINK_LANDING}?token=first-bad-token`]
      })
      app = testApp.app
      router = testApp.router
      app.update()

      await flushPromises()
      app.update()

      // The first, invalid token has already rendered the expired message.
      expect(app.text()).toContain('This link is no longer valid')

      server.resetHandlers()
      server.use(
        rest.post('/api/auth/verifyRecoveryToken', (req, res, ctx) => {
          return res(
            ctx.json({
              nonce: 'second-token-nonce',
              securityQuestionKey: 'FAVORITE_MOVIE',
              retrieveFlow: 'password'
            })
          )
        })
      )

      // A second recovery link is opened — the query string changes, but
      // since the route is the same, the component does not remount.
      router.navigate(
        `${routes.RECOVERY_LINK_LANDING}?token=second-good-token`
      )
      app.update()

      await flushPromises()
      app.update()
      await waitFor(() =>
        router.state.location.pathname.includes(routes.SECURITY_QUESTION)
      )

      expect(router.state.location.pathname).toContain(
        routes.SECURITY_QUESTION
      )
      expect(router.state.location.state).toEqual({
        nonce: 'second-token-nonce',
        securityQuestionKey: 'FAVORITE_MOVIE',
        forgottenItem: 'password'
      })
    })
  })
})
