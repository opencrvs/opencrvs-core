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
import { MINIO_BUCKET } from '@documents/minio/constants'

const mockClient = {
  bucketExists: jest.fn(),
  makeBucket: jest.fn(),
  setBucketPolicy: jest.fn()
}

jest.mock('minio', () => ({
  Client: jest.fn(() => mockClient)
}))

/*
 * test/setupJest.ts replaces this module with a mock in all other test files.
 * Get the real functions, because these tests must use them.
 */
const { ensureDefaultMinioBucket, ensureDefaultMinioBucketIsPrivate } =
  jest.requireActual<typeof import('@documents/minio/client')>(
    '@documents/minio/client'
  )

beforeEach(() => {
  jest.resetAllMocks()
})

describe('ensureDefaultMinioBucketIsPrivate', () => {
  it('removes any bucket policy so nothing is served anonymously', async () => {
    await ensureDefaultMinioBucketIsPrivate()

    expect(mockClient.setBucketPolicy).toHaveBeenCalledWith(MINIO_BUCKET, '')
  })
})

describe('ensureDefaultMinioBucket', () => {
  it('creates the bucket when it does not exist', async () => {
    mockClient.bucketExists.mockResolvedValue(false)

    await ensureDefaultMinioBucket()

    expect(mockClient.makeBucket).toHaveBeenCalledTimes(1)
  })

  it('leaves an existing bucket alone', async () => {
    mockClient.bucketExists.mockResolvedValue(true)

    await ensureDefaultMinioBucket()

    expect(mockClient.makeBucket).not.toHaveBeenCalled()
  })

  it('fails when the bucket could not be created', async () => {
    mockClient.bucketExists.mockResolvedValue(false)
    mockClient.makeBucket.mockRejectedValue(new Error('minio is unreachable'))

    await expect(ensureDefaultMinioBucket()).rejects.toThrow(
      'minio is unreachable'
    )
  })
})
