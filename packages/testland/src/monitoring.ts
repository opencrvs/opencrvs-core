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
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import {
  defaultResource,
  resourceFromAttributes
} from '@opentelemetry/resources'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { readFileSync } from 'fs'
import os from 'os'
import pkgUp from 'pkg-up'

const ignoredIncomingPaths = ['/health/ready', '/ping']

function getRequestPath(url = '') {
  return url.split('?')[0]
}

function isDynamicPathSegment(segment: string) {
  return (
    segment.includes('.') ||
    /^\d+$/.test(segment) ||
    /^[0-9a-f]{24}$/i.test(segment) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      segment
    )
  )
}

function getTracePath(url = '') {
  const path = getRequestPath(url)

  if (!path || path === '/') {
    return '/'
  }

  return path
    .replace(/\/+/g, '/')
    .split('/')
    .map((segment, index) =>
      index > 0 && isDynamicPathSegment(segment) ? '#' : segment
    )
    .join('/')
}

function getHttpSpanName(method = 'GET', url = '') {
  return `${method} ${getTracePath(url)}`
}

function getServiceName(packageJsonPath: string) {
  const packageName = JSON.parse(readFileSync(packageJsonPath, 'utf8')).name

  return (
    process.env.OTEL_SERVICE_NAME ||
    packageName?.replace('@', '').replace('/', '_') ||
    'opencrvs'
  )
}

function getResource(packageJsonPath: string) {
  return defaultResource().merge(
    resourceFromAttributes({
      'service.name': getServiceName(packageJsonPath),
      'host.name': os.hostname(),
      'container.id': process.env.HOSTNAME || '',
      'k8s.node.name': process.env.OTEL_NODE_NAME || ''
    })
  )
}

function initSdk(packageJsonPath: string) {
  const sdk = new NodeSDK({
    resource: getResource(packageJsonPath),
    traceExporter: new OTLPTraceExporter(),
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter()
      })
    ],
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-hapi': {
          enabled: false
        },
        '@opentelemetry/instrumentation-host-metrics': {
          enabled: true,
          metricGroups: [
            'process.cpu',
            'process.memory',
            'system.cpu',
            'system.memory'
          ]
        },
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingRequestHook: (request) =>
            ignoredIncomingPaths.includes(getRequestPath(request.url)),
          requestHook: (span, request) => {
            span.updateName(
              getHttpSpanName(
                request.method,
                'url' in request ? request.url : ''
              )
            )
          }
        }
      })
    ]
  })

  sdk.start()

  process.on('SIGTERM', () => {
    sdk.shutdown().finally(() => process.exit(0))
  })
}

function init() {
  if (process.env.NODE_ENV === 'production') {
    const path = pkgUp.sync()

    initSdk(path!)
  }
}
init()
