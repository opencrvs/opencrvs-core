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
import { generateKeyPairSync, KeyObject } from 'node:crypto'
import { createCoreKeyList } from './key-list'

const JWKS_URL = 'http://auth:4040/.well-known/jwks.json'

function ed25519Jwk(kid: string) {
  const { publicKey } = generateKeyPairSync('ed25519')
  return {
    publicKey,
    jwk: {
      ...publicKey.export({ format: 'jwk' }),
      kid,
      use: 'sig',
      alg: 'EdDSA'
    }
  }
}

const jwtKey = {
  ...generateKeyPairSync('rsa', { modulusLength: 2048 }).publicKey.export({
    format: 'jwk'
  }),
  kid: 'jwt',
  use: 'sig',
  alg: 'RS256'
}

function jwksResponse(keys: unknown[]) {
  return new Response(JSON.stringify({ keys }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

function setup(initialKeys: unknown[]) {
  let keys = initialKeys
  let time = 0
  const fetchKeys = jest.fn(async () => jwksResponse(keys))
  const onFetchError = jest.fn()
  const keyList = createCoreKeyList({
    jwksUrl: JWKS_URL,
    fetch: fetchKeys,
    now: () => time,
    onFetchError
  })
  return {
    keyList,
    fetchKeys,
    onFetchError,
    publish: (next: unknown[]) => {
      keys = next
    },
    advance: (ms: number) => {
      time += ms
    }
  }
}

function sameKey(a: KeyObject | undefined, b: KeyObject) {
  return a?.equals(b) ?? false
}

describe('createCoreKeyList', () => {
  it('fetches the key list on the first lookup and finds the key by kid', async () => {
    const current = ed25519Jwk('core-request-1')
    const { keyList, fetchKeys } = setup([jwtKey, current.jwk])

    expect(
      sameKey(await keyList.findPublicKey('core-request-1'), current.publicKey)
    ).toBe(true)
    expect(fetchKeys).toHaveBeenCalledTimes(1)
    expect(fetchKeys).toHaveBeenCalledWith(JWKS_URL)
  })

  it('does not fetch again for a known kid', async () => {
    const { keyList, fetchKeys } = setup([ed25519Jwk('core-request-1').jwk])

    await keyList.findPublicKey('core-request-1')
    await keyList.findPublicKey('core-request-1')

    expect(fetchKeys).toHaveBeenCalledTimes(1)
  })

  it('never returns the JWT key, which cannot sign core requests', async () => {
    const { keyList } = setup([jwtKey])

    expect(await keyList.findPublicKey('jwt')).toBeUndefined()
  })

  it('ignores Ed25519 keys for another algorithm', async () => {
    const { jwk } = ed25519Jwk('core-request-1')
    const { keyList } = setup([{ ...jwk, alg: 'ES256' }])

    expect(await keyList.findPublicKey('core-request-1')).toBeUndefined()
  })

  it('ignores Ed25519 keys that are not for signatures', async () => {
    const { jwk } = ed25519Jwk('core-request-1')
    const { keyList } = setup([{ ...jwk, use: 'enc' }])

    expect(await keyList.findPublicKey('core-request-1')).toBeUndefined()
  })

  it('fetches again for an unknown kid, to pick up a new key', async () => {
    const old = ed25519Jwk('core-request-1')
    const next = ed25519Jwk('core-request-2')
    const { keyList, fetchKeys, publish, advance } = setup([old.jwk])
    await keyList.findPublicKey('core-request-1')

    publish([old.jwk, next.jwk])
    advance(60_000)

    expect(
      sameKey(await keyList.findPublicKey('core-request-2'), next.publicKey)
    ).toBe(true)
    expect(fetchKeys).toHaveBeenCalledTimes(2)
  })

  it('fetches again at most one time each minute', async () => {
    const { keyList, fetchKeys, advance } = setup([
      ed25519Jwk('core-request-1').jwk
    ])
    await keyList.findPublicKey('core-request-1')

    advance(59_999)
    expect(await keyList.findPublicKey('unknown')).toBeUndefined()
    expect(fetchKeys).toHaveBeenCalledTimes(1)

    advance(1)
    expect(await keyList.findPublicKey('unknown')).toBeUndefined()
    expect(fetchKeys).toHaveBeenCalledTimes(2)
  })

  it('shares one fetch between lookups that arrive at the same time', async () => {
    const { keyList, fetchKeys } = setup([ed25519Jwk('core-request-1').jwk])

    await Promise.all([
      keyList.findPublicKey('core-request-1'),
      keyList.findPublicKey('core-request-1'),
      keyList.findPublicKey('unknown')
    ])

    expect(fetchKeys).toHaveBeenCalledTimes(1)
  })

  it('keeps the known keys when a fetch fails, and waits a minute to fetch again', async () => {
    const current = ed25519Jwk('core-request-1')
    const { keyList, fetchKeys, onFetchError, advance } = setup([current.jwk])
    await keyList.findPublicKey('core-request-1')
    advance(60_000)

    fetchKeys.mockResolvedValueOnce(new Response('down', { status: 503 }))
    expect(await keyList.findPublicKey('unknown')).toBeUndefined()
    expect(onFetchError).toHaveBeenCalledTimes(1)
    expect(
      sameKey(await keyList.findPublicKey('core-request-1'), current.publicKey)
    ).toBe(true)

    advance(59_999)
    expect(await keyList.findPublicKey('unknown')).toBeUndefined()
    expect(fetchKeys).toHaveBeenCalledTimes(2)

    advance(1)
    await keyList.findPublicKey('unknown')
    expect(fetchKeys).toHaveBeenCalledTimes(3)
  })

  it('retries every 5 seconds until the first list arrives, as auth can start after country config', async () => {
    const current = ed25519Jwk('core-request-1')
    const { keyList, fetchKeys, advance } = setup([current.jwk])
    fetchKeys.mockRejectedValueOnce(new Error('ECONNREFUSED'))

    expect(await keyList.findPublicKey('core-request-1')).toBeUndefined()
    advance(4_999)
    expect(await keyList.findPublicKey('core-request-1')).toBeUndefined()
    expect(fetchKeys).toHaveBeenCalledTimes(1)

    advance(1)
    expect(
      sameKey(await keyList.findPublicKey('core-request-1'), current.publicKey)
    ).toBe(true)
    expect(fetchKeys).toHaveBeenCalledTimes(2)
  })

  it('fetches the list when asked, without a lookup', async () => {
    const current = ed25519Jwk('core-request-1')
    const { keyList, fetchKeys } = setup([current.jwk])

    await keyList.refresh()

    expect(fetchKeys).toHaveBeenCalledTimes(1)
    expect(
      sameKey(await keyList.findPublicKey('core-request-1'), current.publicKey)
    ).toBe(true)
    expect(fetchKeys).toHaveBeenCalledTimes(1)
  })
})
