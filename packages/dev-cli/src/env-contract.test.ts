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
      EVENTS_MIGRATOR_URL:
        'postgres://events_migrator:migrator_password@localhost:5432/events',
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
      CLIENT_STORYBOOK_PORT: '6006',
      API_DOCS_PORT: '3003',
      METABASE_PORT: '4444',
      MOSIP_API_PORT: '2024',
      MOSIP_MOCK_PORT: '20240',
      ESIGNET_MOCK_PORT: '20260',

      SQLITE_DATABASE_PATH: '/home/dev/opencrvs-core/data/sqlite/mosip-api.db',

      CLIENT_APP_URL: 'http://localhost:3000/',
      LOGIN_URL: 'http://localhost:3020/',
      GATEWAY_URL: 'http://localhost:7070',
      AUTH_URL: 'http://localhost:4040',
      EVENTS_URL: 'http://localhost:5555/',
      COUNTRY_CONFIG_URL: 'http://localhost:3040',
      COUNTRY_CONFIG_URL_INTERNAL: 'http://localhost:3040/',
      DOCUMENTS_URL: 'http://localhost:9050',

      OPENCRVS_GATEWAY_URL: 'http://localhost:7070',
      OPENCRVS_AUTH_URL: 'http://localhost:4040',
      MOSIP_WEBSUB_CALLBACK_URL: 'http://localhost:2024/websub/callback',
      MOSIP_API_USERINFO_URL:
        'http://localhost:2024/esignet/get-oidp-user-info',
      MOSIP_INTEROP_URL: 'http://localhost:2024',
      ISSUER_URL: 'http://localhost:20240',
      MOSIP_AUTH_URL:
        'http://localhost:20240/v1/authmanager/authenticate/clientidsecretkey',
      MOSIP_WEBSUB_HUB_URL: 'http://localhost:20240/websub/hub',
      MOSIP_VERIFIABLE_CREDENTIAL_ALLOWLIST:
        'http://localhost:20240/.well-known/public-key.json',
      IDA_AUTH_DOMAIN_URI: 'http://localhost:20240',
      IDA_AUTH_URL: 'http://localhost:20240/idauthentication/v1/auth',
      MOSIP_CREATE_PACKET_URL:
        'http://localhost:20240/commons/v1/packetmanager/createPacket',
      MOSIP_PROCESS_PACKET_URL:
        'http://localhost:20240/registrationprocessor/v1/workflowmanager/workflowinstance',
      ESIGNET_USERINFO_URL: 'http://localhost:20260/oidc/userinfo',
      ESIGNET_TOKEN_URL: 'http://localhost:20260/oauth/token',
      ESIGNET_REDIRECT_URL: 'http://localhost:20260/authorize'
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

  it('shifts the manually-launched tool ports too, so two worktrees can each run one', () => {
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

    expect(vars.STORYBOOK_PORT).toBe('16060')
    expect(vars.CLIENT_STORYBOOK_PORT).toBe('16006')
    expect(vars.API_DOCS_PORT).toBe('13003')
    expect(vars.METABASE_PORT).toBe('14444')
  })

  describe('the MOSIP integration', () => {
    const featureA = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: {
        opencrvs_core: { slot: 0, worktreePath: '/p', lastUsedAt: 'x' }
      }
    })

    it('gives each of the three MOSIP services its own port, named so none of them binds the gateway', () => {
      const vars = toEnvironmentVariables(featureA)

      expect(vars.MOSIP_API_PORT).toBe('12024')
      // The mocks ride the 100-port stride, not the default 10000.
      expect(vars.MOSIP_MOCK_PORT).toBe('20340')
      expect(vars.ESIGNET_MOCK_PORT).toBe('20360')

      for (const key of [
        'MOSIP_API_PORT',
        'MOSIP_MOCK_PORT',
        'ESIGNET_MOCK_PORT'
      ]) {
        expect(vars[key]).not.toBe(vars.PORT)
      }
    })

    it('points every composed MOSIP endpoint at this environment, path intact', () => {
      const vars = toEnvironmentVariables(featureA)

      expect(vars.MOSIP_WEBSUB_CALLBACK_URL).toBe(
        'http://localhost:12024/websub/callback'
      )
      expect(vars.MOSIP_INTEROP_URL).toBe('http://localhost:12024')
      expect(vars.MOSIP_AUTH_URL).toBe(
        'http://localhost:20340/v1/authmanager/authenticate/clientidsecretkey'
      )
      expect(vars.ISSUER_URL).toBe('http://localhost:20340')
      expect(vars.ESIGNET_TOKEN_URL).toBe('http://localhost:20360/oauth/token')
      expect(vars.ESIGNET_REDIRECT_URL).toBe('http://localhost:20360/authorize')
    })

    it('hands mosip-api and mosip-mock one and the same callback URL', () => {
      // Read by both ends; two spellings would silently split the pair.
      expect(toEnvironmentVariables(featureA).MOSIP_WEBSUB_CALLBACK_URL).toBe(
        'http://localhost:12024/websub/callback'
      )
    })

    it('addresses core under the names mosip-api reads for it', () => {
      const vars = toEnvironmentVariables(featureA)

      expect(vars.OPENCRVS_GATEWAY_URL).toBe(vars.GATEWAY_URL)
      expect(vars.OPENCRVS_AUTH_URL).toBe(vars.AUTH_URL)
    })

    it('gives the SQLite token store an absolute, per-environment path', () => {
      const vars = toEnvironmentVariables(featureA)

      // Absolute because lerna runs each start script from its own package dir.
      expect(vars.SQLITE_DATABASE_PATH).toBe(
        '/home/dev/wt/feature-a/data/sqlite/mosip-api-feature_a.db'
      )
      expect(vars.SQLITE_DATABASE_PATH).not.toBe(
        toEnvironmentVariables(primary).SQLITE_DATABASE_PATH
      )
    })
  })

  describe('EVENTS_MIGRATOR_URL', () => {
    it('connects as the migrator role, never as the application role', () => {
      const vars = toEnvironmentVariables(primary)

      expect(vars.EVENTS_MIGRATOR_URL).toContain('events_migrator:')
      expect(vars.EVENTS_MIGRATOR_URL).not.toContain('events_app')
      expect(vars.EVENTS_MIGRATOR_URL).not.toBe(vars.EVENTS_POSTGRES_URL)
    })

    it('points at the same database as the application URL, so migrations land where the services read', () => {
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

      expect(vars.EVENTS_MIGRATOR_URL).toBe(
        'postgres://events_migrator:migrator_password@localhost:5432/events_feature_a'
      )
      expect(new URL(vars.EVENTS_MIGRATOR_URL).pathname).toBe(
        new URL(vars.EVENTS_POSTGRES_URL).pathname
      )
    })
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
