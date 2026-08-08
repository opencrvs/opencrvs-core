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
import { describe, expect, it } from 'vitest'
import { formatExportLines, toEnvironmentVariables } from './env-contract'
import { resolveEnvironment } from './resolver'

const primary = resolveEnvironment({
  name: 'opencrvs-core',
  worktreePath: '/home/dev/opencrvs-core',
  isPrimaryWorktree: true,
  isDefaultEnvironment: true,
  registry: {}
})

describe('toEnvironmentVariables', () => {
  it('emits every knob the services and dev.sh consume, unchanged, for the default primary environment', () => {
    expect(toEnvironmentVariables(primary)).toEqual({
      OPENCRVS_ENV_NAME: 'opencrvs_core',
      OPENCRVS_ENV_SLOT: '0',

      TARGET_DB: 'events',
      EVENTS_POSTGRES_URL:
        'postgres://events_app:app_password@localhost:5432/events',
      ANALYTICS_DATABASE_URL:
        'postgres://events_analytics:analytics_password@localhost:5432/events',
      REFERENCE_DATA_DATABASE_URL:
        'postgres://events_reference_data:reference_data_password@localhost:5432/events',
      ES_INDEX_PREFIX: 'events',
      ES_REINDEXING_STATUS_INDEX: 'reindexing_status',
      MINIO_BUCKET: 'ocrvs',
      REDIS_DB: '0',

      CLIENT_PORT: '3000',
      LOGIN_PORT: '3020',
      GATEWAY_PORT: '7070',
      PORT: '7070',
      AUTH_PORT: '4040',
      COUNTRY_CONFIG_PORT: '3040',
      EVENTS_PORT: '5555',
      DOCUMENTS_PORT: '9050',
      STORYBOOK_PORT: '6060',
      API_DOCS_PORT: '3003',

      CLIENT_APP_URL: 'http://localhost:3000/',
      LOGIN_URL: 'http://localhost:3020/',
      GATEWAY_URL: 'http://localhost:7070',
      AUTH_URL: 'http://localhost:4040',
      EVENTS_URL: 'http://localhost:5555/',
      COUNTRY_CONFIG_URL: 'http://localhost:3040',
      COUNTRY_CONFIG_URL_INTERNAL: 'http://localhost:3040/',
      DOCUMENTS_URL: 'http://localhost:9050'
    })
  })

  it('shifts every port and URL by slot*10000 and points Postgres at the environment database', () => {
    const descriptor = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: {
        opencrvs_core: { slot: 0, worktreePath: '/p', lastUsedAt: 'x' }
      }
    })

    const vars = toEnvironmentVariables(descriptor)

    expect(vars.OPENCRVS_ENV_SLOT).toBe('1')
    expect(vars.REDIS_DB).toBe('1')
    expect(vars.GATEWAY_PORT).toBe('17070')
    expect(vars.PORT).toBe(vars.GATEWAY_PORT)
    expect(vars.EVENTS_PORT).toBe('15555')
    expect(vars.GATEWAY_URL).toBe('http://localhost:17070')
    expect(vars.TARGET_DB).toBe('events_feature_a')
    expect(vars.EVENTS_POSTGRES_URL).toContain('/events_feature_a')
    expect(vars.ES_INDEX_PREFIX).toBe('events_feature_a')
    expect(vars.ES_REINDEXING_STATUS_INDEX).toBe(
      'events_feature_a_reindexing_status'
    )
    expect(vars.MINIO_BUCKET).toBe('feature-a--ocrvs')
  })
})

describe('formatExportLines', () => {
  it('produces sourceable `export VAR=value` lines', () => {
    const lines = formatExportLines({ FOO: 'bar', BAZ: '1' }).split('\n')

    expect(lines).toEqual(["export FOO='bar'", "export BAZ='1'"])
  })

  it('quotes values so a shell cannot reinterpret them', () => {
    expect(formatExportLines({ FOO: "it's" })).toBe(
      "export FOO='it'\\''s'" // shell-safe single-quote escaping
    )
  })
})
