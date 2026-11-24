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
import { encodeScope, getUUID, UUID } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { updateUserById } from '@events/storage/postgres/events/users'

/**
 * `owner` has an avatar and a signature under its own path; `viewer` is
 * another user.
 */
async function setupUsersWithFiles() {
  const {
    user: viewer,
    users: [, owner]
  } = await setupTestCase()
  const avatar = `users/${owner.id}/${getUUID()}.jpg`
  const signature = `users/${owner.id}/${getUUID()}.png`

  await updateUserById(owner.id as UUID, {
    profileImagePath: avatar,
    signaturePath: signature
  })

  return { viewer, owner, avatar, signature }
}

describe('user.files.presign', () => {
  test("returns the caller's own avatar and signature, keyed by path", async () => {
    const { owner, avatar, signature } = await setupUsersWithFiles()

    const urls = await createTestClient(owner, []).user.files.presign({
      userIds: [owner.id as UUID]
    })

    expect(urls).toEqual({
      [avatar]: expect.any(String),
      [signature]: expect.any(String)
    })
  })

  test("returns another user's avatar but not their signature without user.read", async () => {
    const { viewer, owner, avatar } = await setupUsersWithFiles()

    const urls = await createTestClient(viewer, []).user.files.presign({
      userIds: [owner.id as UUID]
    })

    expect(urls).toEqual({ [avatar]: expect.any(String) })
  })

  test("returns another user's signature with user.read", async () => {
    const { viewer, owner, signature } = await setupUsersWithFiles()

    const urls = await createTestClient(viewer, [
      encodeScope({ type: 'user.read' })
    ]).user.files.presign({ userIds: [owner.id as UUID] })

    expect(urls).toMatchObject({ [signature]: expect.any(String) })
  })

  test('returns only avatars with avatarsOnly, even for a readable signature', async () => {
    const { viewer, owner, avatar } = await setupUsersWithFiles()

    const urls = await createTestClient(viewer, [
      encodeScope({ type: 'user.read' })
    ]).user.files.presign({ userIds: [owner.id as UUID], avatarsOnly: true })

    expect(urls).toEqual({ [avatar]: expect.any(String) })
  })

  test('returns a signature uploaded under a temporary id', async () => {
    const { owner } = await setupUsersWithFiles()
    const signature = `users/tmp-${getUUID()}/${getUUID()}.png`
    await updateUserById(owner.id as UUID, { signaturePath: signature })

    const urls = await createTestClient(owner, []).user.files.presign({
      userIds: [owner.id as UUID]
    })

    expect(urls).toMatchObject({ [signature]: expect.any(String) })
  })

  test('returns files for several users in one call', async () => {
    // `avatar` is the owner's (from setup); `ownAvatar` is the viewer's own
    const { viewer, owner, avatar } = await setupUsersWithFiles()
    const ownAvatar = `users/${viewer.id}/${getUUID()}.jpg`
    await updateUserById(viewer.id as UUID, { profileImagePath: ownAvatar })

    const urls = await createTestClient(viewer, []).user.files.presign({
      userIds: [viewer.id as UUID, owner.id as UUID]
    })

    expect(urls).toMatchObject({
      [ownAvatar]: expect.any(String),
      [avatar]: expect.any(String)
    })
  })

  test('leaves out unknown users and stored paths that are not a valid key', async () => {
    const { owner } = await setupUsersWithFiles()
    const invalid = `users/../events/${getUUID()}/${getUUID()}.png`
    await updateUserById(owner.id as UUID, { profileImagePath: invalid })

    const urls = await createTestClient(owner, []).user.files.presign({
      userIds: [owner.id as UUID, getUUID()]
    })

    expect(urls).not.toHaveProperty([invalid])
  })

  test.each([
    ['a record attachment', () => `events/${getUUID()}/${getUUID()}.png`],
    ["another user's file", () => `users/${getUUID()}/${getUUID()}.png`]
  ])('leaves out an avatar stored as %s', async (_, makePath) => {
    const { viewer, owner } = await setupUsersWithFiles()
    const avatar = makePath()
    await updateUserById(owner.id as UUID, { profileImagePath: avatar })

    const urls = await createTestClient(viewer, []).user.files.presign({
      userIds: [owner.id as UUID]
    })

    expect(urls).not.toHaveProperty([avatar])
  })

  test('returns a pre-2.0 avatar', async () => {
    const { viewer, owner } = await setupUsersWithFiles()
    const avatar = `${getUUID()}.png`
    await updateUserById(owner.id as UUID, { profileImagePath: avatar })

    const urls = await createTestClient(viewer, []).user.files.presign({
      userIds: [owner.id as UUID]
    })

    expect(urls).toMatchObject({ [avatar]: expect.any(String) })
  })

  test("leaves out a signature stored under another user's path, even with user.read", async () => {
    const { viewer, owner } = await setupUsersWithFiles()
    const signature = `users/${getUUID()}/${getUUID()}.png`
    await updateUserById(owner.id as UUID, { signaturePath: signature })

    const urls = await createTestClient(viewer, [
      encodeScope({ type: 'user.read' })
    ]).user.files.presign({ userIds: [owner.id as UUID] })

    expect(urls).not.toHaveProperty([signature])
  })
})
