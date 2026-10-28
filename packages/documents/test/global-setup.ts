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

/**
 * Starts one RustFS for the whole run, so the tests talk to a real S3 store
 * and not to a mock of one. The version is the one listed in the README.
 *
 * The test workers start after this, so they inherit the settings put in
 * `process.env` here.
 */
export default async function setup() {
  const container = await new GenericContainer('rustfs/rustfs:1.0.1')
    .withEnvironment({
      RUSTFS_ACCESS_KEY: ACCESS_KEY,
      RUSTFS_SECRET_KEY: SECRET_KEY
    })
    .withExposedPorts(S3_PORT)
    .withWaitStrategy(Wait.forHttp('/health', S3_PORT))
    .withStartupTimeout(120_000)
    .start()

  const endpoint = `http://${container.getHost()}:${container.getMappedPort(S3_PORT)}`

  process.env.S3_ENDPOINT = endpoint
  process.env.S3_PUBLIC_ENDPOINT = endpoint
  process.env.S3_ACCESS_KEY = ACCESS_KEY
  process.env.S3_SECRET_KEY = SECRET_KEY

  // Read back by global-teardown.ts
  globalThis.__RUSTFS__ = container
}
