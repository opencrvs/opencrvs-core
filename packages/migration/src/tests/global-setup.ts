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

import { PostgreSqlContainer } from '@testcontainers/postgresql'
import type { ProvidedContext } from 'vitest'

type ProvideFunction = <K extends keyof ProvidedContext>(
  key: K,
  value: ProvidedContext[K]
) => void

/**
 * A bare Postgres server with nothing but the superuser: no `events`
 * database, no roles, no schemas. Everything the provisioning command is
 * supposed to create must be created by the provisioning command.
 */
async function setupPostgresServer() {
  return new PostgreSqlContainer('postgres:17.6')
    .withUsername('postgres')
    .withPassword('postgres')
    .withDatabase('postgres')
    .withExposedPorts(5432)
    .withStartupTimeout(120_000)
    .start()
}

export default async function setup({ provide }: { provide: ProvideFunction }) {
  const psql = await setupPostgresServer()

  provide(
    'POSTGRES_ADMIN_URL',
    `postgres://postgres:postgres@${psql.getHost()}:${psql.getMappedPort(
      5432
    )}/postgres`
  )

  return async () => {
    await psql.stop()
  }
}
