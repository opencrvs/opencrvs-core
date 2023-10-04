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
import { createServer } from '@documents/server'
jest.mock('../../minio/client', () => {
  return {
    __esModule: true,
    minioClient: { putObject: () => {} }
  }
})

describe('verify document uploader handler', () => {
  let server: any
  beforeEach(async () => {
    server = await createServer()
  })

  it('returns ok for valid request', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/upload-vs-export',
      payload: {
        fileData:
          'RVBORw0KGgoAAAANSUhEUgAAAlwAAAK8CAYAAAA6WGEyAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2h'
      }
    })

    expect(res.statusCode).toBe(200)
  })
})
