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
import { GenericContainer, type StartedTestContainer } from 'testcontainers'
import { start, stop } from './redis'

const REDIS_HTTP_PORT = 6379

const container = new GenericContainer('redis:5')

export const startContainer = async () => {
  const testContainer = await container
    .withExposedPorts(REDIS_HTTP_PORT)
    .withStartupTimeout(120_000)
    .start()

  await start(
    testContainer.getHost(),
    testContainer.getMappedPort(REDIS_HTTP_PORT)
  )

  return testContainer
}

export const stopContainer = async (
  container: StartedTestContainer
): Promise<void> => {
  try {
    await stop()
  } catch (error) {
  } finally {
    await container.stop()
  }
}
