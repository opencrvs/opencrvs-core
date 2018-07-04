import * as moxios from 'moxios'
import { createTestApp } from './tests/util'
import { client } from './utils/authApi'
import { resolve } from 'url'
import { config } from './config'

const wait = () => new Promise(res => process.nextTick(res))

it('renders without crashing', async () => {
  createTestApp()
})

it('renders a phone number and a password field on startup', async () => {
  const app = createTestApp()
  expect(app.find('input')).toHaveLength(2)
})

describe('Login app', () => {
  beforeEach(() => {
    moxios.install(client)

    moxios.stubRequest(resolve(config.AUTH_API_URL, 'resend-sms'), {
      status: 200
    })

    moxios.stubRequest(resolve(config.AUTH_API_URL, 'authenticate'), {
      status: 200,
      responseText: "{ nonce: '12345' }"
    })
  })
  afterEach(() => {
    moxios.uninstall(client)
  })

  describe('when credential form is filled', () => {
    let app: any
    beforeEach(() => {
      app = createTestApp()
      app
        .find('input#mobile')
        .simulate('change', { target: { value: '07111111111' } })

      app
        .find('input#password')
        .simulate('change', { target: { value: 'test' } })
    })

    it('sends the phone number and the password to our api when user submits the form', async () => {
      app.find('form#STEP_ONE').simulate('submit')
      await wait()
      const request = moxios.requests.mostRecent()
      expect(request.url).toMatch(/authenticate/)
    })

    it('redirects user to verification code form once mobile number and password are accepted', async () => {
      app.find('form#STEP_ONE').simulate('submit')
      await wait()
      app.update()
      expect(app.find('form#STEP_TWO')).toHaveLength(1)
    })

    describe('SMS resend button', () => {
      beforeEach(async () => {
        app.find('form#STEP_ONE').simulate('submit')
        await wait()
        app.update()
      })
      it('calls a backend api that resends a SMS', async () => {
        app.find('button#login-mobile-resend').simulate('click')
        await wait()
        const request = moxios.requests.mostRecent()
        expect(request.url).toMatch(/resend-sms/)
      })
    })
  })
})
