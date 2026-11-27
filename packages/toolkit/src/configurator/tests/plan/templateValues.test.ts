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
import { bindings } from '../../ui/bindings/load'
import { defaultAddress } from '../../ui/form/functions'
import { DEFAULT_HOSTS } from '../../ui/plan/dependencyHosts'
import { builtInValues, templateValues } from '../../ui/plan/templateValues'

const SERVICES = 'charts-values/opencrvs-services/values.yaml'
const DEPENDENCIES = 'charts-values/dependencies/values.yaml'
const TRAEFIK = 'charts-values/traefik/values.yaml'
const OTEL = 'http://opentelemetry-collector.opencrvs-deps-qa.svc.cluster.local:4317'

describe('built-in addresses', () => {
  it('go to every template variable that a question with an address feeds, without being listed per variable', () => {
    expect(builtInValues(SERVICES, 'qa', bindings)).toEqual({
      elasticsearch_host: 'elasticsearch.opencrvs-deps-qa.svc.cluster.local',
      s3_host: 'rustfs-0.rustfs.opencrvs-deps-qa.svc.cluster.local',
      postgres_host: 'postgres-0.postgres.opencrvs-deps-qa.svc.cluster.local',
      redis_host: 'redis-0.redis.opencrvs-deps-qa.svc.cluster.local',
      exporter_otlp_endpoint: OTEL
    })
    // one question, several templates
    expect(builtInValues(DEPENDENCIES, 'qa', bindings)).toEqual({ elasticsearch_host: 'elasticsearch.opencrvs-deps-qa.svc.cluster.local' })
    expect(builtInValues(TRAEFIK, 'qa', bindings)).toEqual({ otel_collector_endpoint: OTEL })
    expect(builtInValues('inventory/inventory.template.yml', 'qa', bindings)).toEqual({})
  })

  it('fill a hidden question, and give way to an answer', () => {
    expect(templateValues(SERVICES, 'qa', {}, bindings)).toMatchObject({ postgres_host: DEFAULT_HOSTS.POSTGRES_HOST!('qa'), exporter_otlp_endpoint: OTEL })
    expect(templateValues(TRAEFIK, 'qa', {}, bindings)).toMatchObject({ otel_collector_endpoint: OTEL })

    const own = templateValues(SERVICES, 'qa', { POSTGRES_HOST: 'db.example.org', OTEL_COLLECTOR_ENDPOINT: 'otel.example.org:4317' }, bindings)
    expect(own).toMatchObject({ postgres_host: 'db.example.org', exporter_otlp_endpoint: 'otel.example.org:4317', redis_host: DEFAULT_HOSTS.REDIS_HOST!('qa') })
    // the collector's endpoint reaches Traefik too
    expect(templateValues(TRAEFIK, 'qa', { OTEL_COLLECTOR_ENDPOINT: 'otel.example.org:4317' }, bindings)).toMatchObject({
      otel_collector_endpoint: 'otel.example.org:4317'
    })
  })

  it('are used for an empty answer as well', () => {
    expect(templateValues(SERVICES, 'qa', { S3_HOST: '' }, bindings).s3_host).toBe(DEFAULT_HOSTS.S3_HOST!('qa'))
  })
})

describe('defaultAddress, the form function', () => {
  it('gives the address of the question, once the environment has a name', () => {
    for (const [question, address] of Object.entries(DEFAULT_HOSTS)) expect(defaultAddress(question, 'my-env')).toBe(address('my-env'))
    expect(defaultAddress('POSTGRES_HOST', '')).toBe('')
    expect(defaultAddress('POSTGRES_HOST', undefined)).toBe('')
    expect(defaultAddress('NO_SUCH_QUESTION', 'qa')).toBe('')
  })
})
