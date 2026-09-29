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

import { Writable } from 'stream'
import pino from 'pino'
import { buildLoggerOptions, normalizeLogArgs } from './logger'

function createCapturingLogger() {
  const records: Record<string, unknown>[] = []
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      records.push(JSON.parse(chunk.toString()))
      callback()
    }
  })
  const testLogger = pino({ ...buildLoggerOptions(), level: 'debug' }, stream)
  return { testLogger, records }
}

describe('logger levels merge trailing arguments (integration)', () => {
  it.each(['info', 'warn', 'error', 'debug'] as const)(
    'logger.%s merges a trailing Error under `err` with message and stack',
    (level) => {
      const { testLogger, records } = createCapturingLogger()
      const err = new Error('Connection refused')

      testLogger[level]('Error occurred', err)

      expect(records[0].msg).toEqual('Error occurred')
      expect(records[0].err).toMatchObject({ message: 'Connection refused' })
      expect((records[0].err as { stack: string }).stack).toContain(
        'Connection refused'
      )
    }
  )

  it('logger.warn merges a trailing plain object into top-level fields', () => {
    const { testLogger, records } = createCapturingLogger()

    testLogger.warn('Invalid payload', { field: 'email' })

    expect(records[0].msg).toEqual('Invalid payload')
    expect(records[0].field).toEqual('email')
  })

  it('logger.info appends trailing primitives inline onto the message', () => {
    const { testLogger, records } = createCapturingLogger()

    testLogger.info('Retry attempt', 3, 'of', 5)

    expect(records[0].msg).toEqual('Retry attempt 3 of 5')
  })

  it('logger.error handles a string, number, object and Error together', () => {
    const { testLogger, records } = createCapturingLogger()
    const err = new Error('Connection refused')

    testLogger.error(
      'Sync failed for user',
      42,
      { userId: 42, action: 'sync' },
      err
    )

    expect(records[0].msg).toEqual('Sync failed for user 42')
    expect(records[0].userId).toEqual(42)
    expect(records[0].action).toEqual('sync')
    expect(records[0].err).toMatchObject({ message: 'Connection refused' })
  })
})

describe('normalizeLogArgs()', () => {
  it('leaves a single string message unchanged', () => {
    const result = normalizeLogArgs(['User created'])
    expect(result).toEqual(['User created'])
  })

  it('merges a trailing Error under an `err` field with message and stack preserved', () => {
    const err = new Error('Connection refused')

    const [mergingObject, message] = normalizeLogArgs([
      'Error occurred',
      err
    ]) as [{ err: { message: string; stack: string } }, string]

    expect(message).toEqual('Error occurred')
    expect(mergingObject.err.message).toEqual('Connection refused')
    expect(mergingObject.err.stack).toContain('Connection refused')
  })

  it('merges a trailing plain object as top-level structured fields', () => {
    const result = normalizeLogArgs(['User created', { userId: 123 }])
    expect(result).toEqual([{ userId: 123 }, 'User created'])
  })

  it('appends trailing primitive values inline onto the message', () => {
    const result = normalizeLogArgs(['Retry attempt', 3, 'of', 5])
    expect(result).toEqual(['Retry attempt 3 of 5'])
  })

  it('combines an Error, a plain object and a primitive in one call', () => {
    const err = new Error('boom')

    const [mergingObject, message] = normalizeLogArgs([
      'Reindex failed',
      err,
      { indexName: 'events_v2' },
      'retrying'
    ]) as [{ err: { message: string }; indexName: string }, string]

    expect(message).toEqual('Reindex failed retrying')
    expect(mergingObject.err.message).toEqual('boom')
    expect(mergingObject.indexName).toEqual('events_v2')
  })

  it('leaves pino-native object-first calls unchanged', () => {
    const result = normalizeLogArgs([
      { req: { url: '/ping' } },
      'incoming request'
    ])
    expect(result).toEqual([{ req: { url: '/ping' } }, 'incoming request'])
  })
})
