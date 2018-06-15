import { createTestApp } from './tests/util'

it('renders without crashing', async () => {
  createTestApp()
})

it('shows "Loading" text when data is loading', async () => {
  const app = createTestApp()
  expect(app.text()).toMatch(/Loading/)
})

it(`shows mother's name text when data is loaded`, async () => {
  const app = createTestApp()
  await jest.clearAllTimers()
  expect(app.text()).toMatch(/Mothers name/)
})
