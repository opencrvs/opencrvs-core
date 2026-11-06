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
import { GenericContainer, Wait } from 'testcontainers'

const S3_PORT = 9000
const ACCESS_KEY = 'documents-test'
const SECRET_KEY = 'documents-test-secret'

/** The versions are the ones listed in the README. */
const stores = {
  RUSTFS: () =>
    new GenericContainer('rustfs/rustfs:1.0.1')
      .withEnvironment({
        RUSTFS_ACCESS_KEY: ACCESS_KEY,
        RUSTFS_SECRET_KEY: SECRET_KEY
      })
      .withWaitStrategy(Wait.forHttp('/health', S3_PORT)),
  MINIO: () =>
    new GenericContainer('ghcr.io/opencrvs/minio:release.2025-06-13t11-33-47z')
      .withEnvironment({
        MINIO_ROOT_USER: ACCESS_KEY,
        MINIO_ROOT_PASSWORD: SECRET_KEY
      })
      .withCommand(['server', '/data'])
      .withWaitStrategy(Wait.forHttp('/minio/health/live', S3_PORT))
}

/**
 * Starts one container for each store for the whole run, so the tests talk to
 * real S3 stores and not to a mock of one. Each Jest project in
 * jest.config.js runs all the tests against one of the stores.
 *
 * The test workers start after this, so they inherit the settings put in
 * `process.env` here. test/setupJest.ts reads the endpoint of its store.
 */
export default async function setup() {
  const containers = await Promise.all(
    Object.entries(stores).map(async ([store, container]) => {
      const started = await container()
        .withExposedPorts(S3_PORT)
        .withStartupTimeout(120_000)
        .start()

      process.env[`S3_ENDPOINT_${store}`] =
        `http://${started.getHost()}:${started.getMappedPort(S3_PORT)}`

      return started
    })
  )

  process.env.S3_ACCESS_KEY = ACCESS_KEY
  process.env.S3_SECRET_KEY = SECRET_KEY

  // Read back by global-teardown.ts
  globalThis.__S3_STORES__ = containers
}
