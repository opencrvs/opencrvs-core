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

import { getUUID } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

describe('user.changeAvatar', () => {
  test('throws FORBIDDEN when changing another user avatar', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    await expect(
      client.user.changeAvatar({
        userId: getUUID(),
        avatar: '/users/other/avatar.png'
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  test('throws UNAUTHORIZED when subject not active', async () => {
    const { user, eventsDb } = await setupTestCase()
    await eventsDb
      .updateTable('users')
      .set({ status: 'deactivated' })
      .where('id', '=', user.id)
      .execute()
    const client = createTestClient(user)

    await expect(
      client.user.changeAvatar({
        userId: user.id,
        avatar: '/users/me/avatar.png'
      })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  test('persists provided MinIO path as profileImagePath', async () => {
    const { user, eventsDb } = await setupTestCase()
    const client = createTestClient(user)
    const path = `/users/${user.id}/avatar-${getUUID()}.png`

    await client.user.changeAvatar({ userId: user.id, avatar: path })

    const dbUser = await eventsDb
      .selectFrom('users')
      .select('profileImagePath')
      .where('id', '=', user.id)
      .executeTakeFirstOrThrow()

    expect(dbUser.profileImagePath).toBe(path)
  })

  test('rejects non-string avatar payload', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    await expect(
      client.user.changeAvatar({
        userId: user.id,
        // @ts-expect-error intentionally wrong shape
        avatar: { type: 'image/png', data: '/users/me/avatar.png' }
      })
    ).rejects.toThrow()
  })
})
