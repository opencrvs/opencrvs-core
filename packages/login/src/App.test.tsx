import * as moxios from 'moxios'
import { createTestApp } from './tests/util'
import { client } from './utils/authApi'

it('renders without crashing', async () => {
  createTestApp()
})

it('renders a phone number and a password field on startup', async () => {
  const app = createTestApp()
  expect(app.find('input')).toHaveLength(2)
})

describe('foo', () => {
  beforeEach(() => {
    moxios.install(client)
  })
  afterEach(() => {
    moxios.uninstall(client)
  })
  it.only('sends the phone number and the password to our api when user submits the form', async () => {
    const app = createTestApp()

    app
      .find('input#mobile')
      .simulate('change', { target: { value: '04477897788' } })

    app
      .find('input#password')
      .simulate('change', { target: { value: 'hello' } })

    app.find('form#STEP_ONE').simulate('submit')

    await jest.clearAllTimers()

    const request = moxios.requests.mostRecent()

    expect(request.url).toMatch(/authenticate/)
  })
})
