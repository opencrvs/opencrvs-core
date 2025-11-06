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

import { ServerResponse } from 'http'
import { logger } from '@opencrvs/commons'
import { getOrCreateClient as getElasticsearchClient } from '@events/storage/elasticsearch'
import { getClient as getPostgresClient } from '@events/storage/postgres/events'
import { env } from '@events/environment'

export interface HealthCheckResult {
  status: 'ok' | 'error'
  checks: {
    postgres: { status: 'ok' | 'error'; error?: string }
    elasticsearch: { status: 'ok' | 'error'; error?: string }
    countryConfig: { status: 'ok' | 'error'; error?: string }
  }
}

export interface HealthCheckResponse {
  statusCode: number
  body: string
  headers: { [key: string]: string }
}

export async function checkPostgresHealth(): Promise<{
  status: 'ok' | 'error'
  error?: string
}> {
  try {
    const client = getPostgresClient()
    await client.selectFrom('events').limit(1).execute()
    return { status: 'ok' }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    logger.error(`Postgres health check failed: ${errorMessage}`)
    return { status: 'error', error: errorMessage }
  }
}

export async function checkElasticsearchHealth(): Promise<{
  status: 'ok' | 'error'
  error?: string
}> {
  try {
    const client = getElasticsearchClient()
    await client.ping()
    return { status: 'ok' }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    logger.error(`Elasticsearch health check failed: ${errorMessage}`)
    return { status: 'error', error: errorMessage }
  }
}

export async function checkCountryConfigHealth(): Promise<{
  status: 'ok' | 'error'
  error?: string
}> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${env.COUNTRY_CONFIG_URL}/ping`, {
      method: 'GET',
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      return { status: 'ok' }
    } else {
      const errorMessage = `Country config returned status ${response.status}`
      logger.error(`Country config health check failed: ${errorMessage}`)
      return { status: 'error', error: errorMessage }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    logger.error(`Country config health check failed: ${errorMessage}`)
    return { status: 'error', error: errorMessage }
  }
}

export async function performHealthCheck(): Promise<HealthCheckResponse> {
  try {
    const [postgresCheck, elasticsearchCheck, countryConfigCheck] =
      await Promise.allSettled([
        checkPostgresHealth(),
        checkElasticsearchHealth(),
        checkCountryConfigHealth()
      ])

    const result: HealthCheckResult = {
      status: 'ok',
      checks: {
        postgres:
          postgresCheck.status === 'fulfilled'
            ? postgresCheck.value
            : { status: 'error', error: 'Health check failed' },
        elasticsearch:
          elasticsearchCheck.status === 'fulfilled'
            ? elasticsearchCheck.value
            : { status: 'error', error: 'Health check failed' },
        countryConfig:
          countryConfigCheck.status === 'fulfilled'
            ? countryConfigCheck.value
            : { status: 'error', error: 'Health check failed' }
      }
    }

    // If any check failed, mark overall status as error
    const hasError = Object.values(result.checks).some(
      (check) => check.status === 'error'
    )
    if (hasError) {
      result.status = 'error'
    }

    // Format response
    const statusCode = result.status === 'ok' ? 200 : 500
    return {
      statusCode,
      body: JSON.stringify(result),
      headers: { 'Content-Type': 'application/json' }
    }
  } catch (error) {
    logger.error('Health check failed:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      headers: { 'Content-Type': 'application/json' }
    }
  }
}

export async function handleHealthCheckResponse(
  res: ServerResponse
): Promise<void> {
  try {
    const healthResponse = await performHealthCheck()
    res.writeHead(healthResponse.statusCode, healthResponse.headers)
    res.end(healthResponse.body)
  } catch (error) {
    logger.error('Unexpected error in health check handler:', error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        status: 'error',
        error: 'Internal server error'
      })
    )
  }
}
