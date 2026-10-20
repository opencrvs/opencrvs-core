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

const CONFIG_KEYS = [
  'S3_HOST',
  'S3_PORT',
  'S3_USE_SSL',
  'S3_PUBLIC_URL',
  'S3_PROTOCOL',
  'S3_BUCKET',
  'S3_BUCKET_REGION',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY'
]

/**
 * The constants are read when the module loads, so each case loads it afresh
 * with only the variables it names, and puts the environment back afterwards.
 */
function loadConstants(env: Record<string, string> = {}) {
  const saved = { ...process.env }

  for (const key of CONFIG_KEYS) {
    delete process.env[key]
  }
  Object.assign(process.env, env)

  try {
    let constants!: typeof import('@documents/s3/constants')
    jest.isolateModules(() => {
      constants = jest.requireActual('@documents/s3/constants')
    })
    return constants
  } finally {
    process.env = saved
  }
}

describe('s3 constants', () => {
  it('defaults to the store of the development environment', () => {
    const constants = loadConstants()

    expect(constants.S3_HOST).toBe('localhost')
    expect(constants.S3_PORT).toBe(3535)
    expect(constants.S3_USE_SSL).toBe(false)
    expect(constants.S3_PUBLIC_URL).toBe('localhost:3535')
    expect(constants.S3_BUCKET).toBe('ocrvs')
    expect(constants.S3_BUCKET_REGION).toBe('local')
    expect(constants.S3_ACCESS_KEY).toBe('minioadmin')
    expect(constants.S3_SECRET_KEY).toBe('minioadmin')
  })

  it('reads the S3_ variables', () => {
    const constants = loadConstants({
      S3_HOST: 's3-0.s3',
      S3_PORT: '9000',
      S3_PUBLIC_URL: 's3.example.org',
      S3_PROTOCOL: 'https:',
      S3_BUCKET: 'civil-registry',
      S3_BUCKET_REGION: 'eu-west-1',
      S3_ACCESS_KEY: 's3-key',
      S3_SECRET_KEY: 's3-secret'
    })

    expect(constants.S3_HOST).toBe('s3-0.s3')
    expect(constants.S3_PORT).toBe(9000)
    expect(constants.S3_PUBLIC_URL).toBe('s3.example.org')
    expect(constants.S3_PROTOCOL).toBe('https:')
    expect(constants.S3_BUCKET).toBe('civil-registry')
    expect(constants.S3_BUCKET_REGION).toBe('eu-west-1')
    expect(constants.S3_ACCESS_KEY).toBe('s3-key')
    expect(constants.S3_SECRET_KEY).toBe('s3-secret')
  })

  it('treats an empty S3_ variable as unset', () => {
    const constants = loadConstants({ S3_HOST: '', S3_BUCKET: '' })

    expect(constants.S3_HOST).toBe('localhost')
    expect(constants.S3_BUCKET).toBe('ocrvs')
  })

  it('connects over TLS only when asked to', () => {
    expect(loadConstants({ S3_USE_SSL: 'true' }).S3_USE_SSL).toBe(true)
    expect(loadConstants({ S3_USE_SSL: 'false' }).S3_USE_SSL).toBe(false)
  })
})
