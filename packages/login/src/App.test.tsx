import * as moxios from 'moxios'
import { createTestApp, wait } from '@login/tests/util'
import { client } from '@login/utils/authApi'
import { resolve } from 'url'
import { ReactWrapper } from 'enzyme'

it('renders without crashing', async () => {
  createTestApp()
})

it('renders a phone number and a password field on startup', async () => {
  const { app } = await createTestApp()
  expect(app.find('input')).toHaveLength(2)
})

describe('Login app step one', () => {
  beforeEach(() => {
    moxios.install(client)
  })
  afterEach(() => {
    moxios.uninstall(client)
  })

  describe('when credential form is filled', () => {
    let app: ReactWrapper<{}, {}>
    beforeEach(async () => {
      const appBundle = await createTestApp()
      app = appBundle.app
      app
        .find('input#username')
        .simulate('change', { target: { value: '01711111111' } })

      app
        .find('input#password')
        .simulate('change', { target: { value: 'test' } })
    })

    afterEach(() => {
      app.unmount()
    })
    it('sends the phone number and the password to our api when user submits the form', async () => {
      moxios.stubRequest(resolve(window.config.AUTH_API_URL, 'authenticate'), {
        status: 401,
        responseText: { message: 'unauthorized' }
      })

      app.find('form#STEP_ONE').simulate('submit')
      await wait()
      const request = moxios.requests.mostRecent()
      expect(request.url).toMatch(/authenticate/)
    })

    it('displays loading spinner when the user is submitting the form', async done => {
      moxios.stubRequest(resolve(window.config.AUTH_API_URL, 'authenticate'), {
        status: 400,
        responseText: { message: 'bad request' }
      })

      app.find('form#STEP_ONE').simulate('submit')
      moxios.wait(() => {
        expect(app.find('#login-submitting-spinner')).toHaveLength(3)
        done()
      })
    })

    it('redirects user to verification code form once username and password are accepted', async done => {
      moxios.stubRequest(resolve(window.config.AUTH_API_URL, 'authenticate'), {
        status: 200,
        responseText: "{ nonce: '12345' }"
      })
      app.find('form#STEP_ONE').simulate('submit')
      await wait()
      done()
      app.update()
      expect(app.find('form#STEP_TWO')).toHaveLength(1)
    })
  })
})
