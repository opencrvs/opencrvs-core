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
  'HOST',
  'PORT',
  'PUBLIC_URL',
  'URL',
  'PROTOCOL',
  'BUCKET_REGION',
  'ACCESS_KEY',
  'SECRET_KEY'
].flatMap((name) => [`S3_${name}`, `MINIO_${name}`])

const OTHER_KEYS = ['S3_USE_SSL', 'S3_BUCKET', 'MINIO_BUCKET']

/**
 * The constants are read when the module loads, so each case loads it afresh
 * with only the variables it names, and puts the environment back afterwards.
 */
function loadConstants(env: Record<string, string> = {}) {
  const saved = { ...process.env }

  for (const key of [...CONFIG_KEYS, ...OTHER_KEYS]) {
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
  it('defaults to a local MinIO', () => {
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

  it('reads the MINIO_ variables that existing deployments set', () => {
    const constants = loadConstants({
      MINIO_HOST: 'minio-0.minio',
      MINIO_PORT: '9000',
      MINIO_URL: 'minio.example.org',
      MINIO_PROTOCOL: 'https:',
      MINIO_BUCKET_REGION: 'eu-west-1',
      MINIO_ACCESS_KEY: 'minio-key',
      MINIO_SECRET_KEY: 'minio-secret'
    })

    expect(constants.S3_HOST).toBe('minio-0.minio')
    expect(constants.S3_PORT).toBe(9000)
    expect(constants.S3_PUBLIC_URL).toBe('minio.example.org')
    expect(constants.S3_PROTOCOL).toBe('https:')
    expect(constants.S3_BUCKET_REGION).toBe('eu-west-1')
    expect(constants.S3_ACCESS_KEY).toBe('minio-key')
    expect(constants.S3_SECRET_KEY).toBe('minio-secret')
  })

  it('prefers an S3_ variable over the MINIO_ one', () => {
    const constants = loadConstants({
      S3_HOST: 's3.internal',
      MINIO_HOST: 'minio-0.minio',
      S3_ACCESS_KEY: 's3-key',
      MINIO_ACCESS_KEY: 'minio-key'
    })

    expect(constants.S3_HOST).toBe('s3.internal')
    expect(constants.S3_ACCESS_KEY).toBe('s3-key')
  })

  it('reads the public URL from S3_PUBLIC_URL, which replaces MINIO_URL', () => {
    expect(
      loadConstants({ S3_PUBLIC_URL: 'files.example.org' }).S3_PUBLIC_URL
    ).toBe('files.example.org')
    expect(
      loadConstants({
        S3_PUBLIC_URL: 'files.example.org',
        MINIO_URL: 'minio.example.org'
      }).S3_PUBLIC_URL
    ).toBe('files.example.org')
  })

  it('does not read a bare S3_URL, which is not a setting', () => {
    expect(loadConstants({ S3_URL: 'ignored.example.org' }).S3_PUBLIC_URL).toBe(
      'localhost:3535'
    )
  })

  it('treats an empty S3_ variable as unset', () => {
    const constants = loadConstants({
      S3_HOST: '',
      MINIO_HOST: 'minio-0.minio'
    })

    expect(constants.S3_HOST).toBe('minio-0.minio')
  })

  it('takes the bucket from MINIO_BUCKET only, as the migrations and the chart do', () => {
    const constants = loadConstants({
      S3_BUCKET: 'ignored',
      MINIO_BUCKET: 'civil-registry'
    })

    expect(constants.S3_BUCKET).toBe('civil-registry')
  })

  it('connects over TLS only when asked to', () => {
    expect(loadConstants({ S3_USE_SSL: 'true' }).S3_USE_SSL).toBe(true)
    expect(loadConstants({ S3_USE_SSL: 'false' }).S3_USE_SSL).toBe(false)
  })
})
