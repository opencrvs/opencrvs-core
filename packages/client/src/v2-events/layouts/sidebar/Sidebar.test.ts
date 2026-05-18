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
import { logout } from './Sidebar'

const assignMock = vi.fn()

beforeAll(() => {
  // @ts-ignore
  delete window.location
  // @ts-ignore
  window.location = {
    assign: assignMock,
    replace: vi.fn(),
    href: '',
    origin: 'http://localhost'
  }
})

afterAll(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  assignMock.mockClear()
})

test('Redirects to relative login path on logout', async () => {
  await logout('en')

  expect(assignMock).toHaveBeenCalledWith(
    expect.stringContaining('/login?lang=en')
  )
})

test('Redirects to login page on logout', async () => {
  await logout()

  expect(assignMock).toHaveBeenCalledWith(
    expect.stringContaining('/login?lang=')
  )
})
