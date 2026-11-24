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
import { createPublicKey, generateKeyPairSync, KeyObject } from 'node:crypto'
import {
  contentDigest,
  CoreRequest,
  CoreRequestSignatureHeaders,
  REJECTION,
  signCoreRequest,
  verifyCoreRequest,
  withCoreSignature
} from './signature'

/* The examples published in opencrvs-core#14240. */
const EXAMPLE_KEYID = 'core-request-2026-10'
const EXAMPLE_PUBLIC_KEY = createPublicKey({
  key: {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'ilS77yr8Jcat2XcQABmsv75JDG7v_EVyCR2if0InlOs'
  },
  format: 'jwk'
})
const EXAMPLE_CREATED_MS = 1792745400 * 1000
const EXAMPLE_SIGNATURE_INPUT =
  'core=("@method" "@path" "@query" "content-digest");created=1792745400;keyid="core-request-2026-10";alg="ed25519";tag="opencrvs-core-request"'
const EXAMPLE_BODY =
  '{"id":"0f6a7c1e-3b2d-4e8f-9a1c-5d7e9f2b4c6a","type":"birth"}'

const exampleGet: CoreRequest = {
  method: 'GET',
  path: '/config/events',
  query: '',
  rawBody: Buffer.alloc(0),
  headers: {
    'content-digest': 'sha-256=:47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=:',
    'signature-input': EXAMPLE_SIGNATURE_INPUT,
    signature:
      'core=:ovUpEanMmX0hoI7JP4S3ZC2tQoJvDMhLx/voP+g09zwa75jOmeol9R6W7odzJEWMUKAPvHWIx9FSzm7HN3mrAQ==:'
  }
}

const examplePost: CoreRequest = {
  method: 'POST',
  path: '/trigger/events/birth/actions/REGISTER',
  query: '',
  rawBody: Buffer.from(EXAMPLE_BODY),
  headers: {
    'content-digest': 'sha-256=:+wxoBkYMub9tdlaH63hJhafDZdebKH6gGp1+NdBdKoY=:',
    'signature-input': EXAMPLE_SIGNATURE_INPUT,
    signature:
      'core=:2ZGsFdfgNYjCyThGNXNU64LNRl+dQ8ZisbehH30CQxp8ULZw2Vp18U3HRTr0EqRefLtkfUrrwRhAtew59N34Ag==:'
  }
}

function keysById(keys: Record<string, KeyObject>) {
  return async (keyid: string) => keys[keyid]
}

const findExampleKey = keysById({ [EXAMPLE_KEYID]: EXAMPLE_PUBLIC_KEY })

/** Header names as Node gives them to a server: lower case. */
function asReceived(headers: CoreRequestSignatureHeaders) {
  return {
    'content-digest': headers['Content-Digest'],
    'signature-input': headers['Signature-Input'],
    signature: headers.Signature
  }
}

function withHeader(request: CoreRequest, name: string, value: string) {
  return { ...request, headers: { ...request.headers, [name]: value } }
}

describe('verifyCoreRequest', () => {
  it('accepts the configuration read from the ticket example', async () => {
    expect(
      await verifyCoreRequest(exampleGet, findExampleKey, EXAMPLE_CREATED_MS)
    ).toEqual({ valid: true, keyid: EXAMPLE_KEYID })
  })

  it('accepts the action confirmation from the ticket example', async () => {
    expect(
      await verifyCoreRequest(examplePost, findExampleKey, EXAMPLE_CREATED_MS)
    ).toEqual({ valid: true, keyid: EXAMPLE_KEYID })
  })

  it('rejects a request with no signature', async () => {
    const { headers } = examplePost
    const result = await verifyCoreRequest(
      {
        ...examplePost,
        headers: { 'content-digest': headers['content-digest'] }
      },
      findExampleKey,
      EXAMPLE_CREATED_MS
    )
    expect(result.valid).toBe(false)
  })

  it('rejects a changed body that keeps the original digest', async () => {
    const result = await verifyCoreRequest(
      {
        ...examplePost,
        rawBody: Buffer.from(EXAMPLE_BODY.replace('birth', 'death'))
      },
      findExampleKey,
      EXAMPLE_CREATED_MS
    )
    expect(result).toEqual({
      valid: false,
      reason: REJECTION.WRONG_BODY
    })
  })

  it('rejects a changed body that comes with a new digest', async () => {
    const changed = EXAMPLE_BODY.replace('birth', 'death')
    const result = await verifyCoreRequest(
      withHeader(
        { ...examplePost, rawBody: Buffer.from(changed) },
        'content-digest',
        contentDigest(changed)
      ),
      findExampleKey,
      EXAMPLE_CREATED_MS
    )
    expect(result).toEqual({
      valid: false,
      reason: REJECTION.WRONG_SIGNATURE
    })
  })

  it('rejects a signed request sent to a different path', async () => {
    const result = await verifyCoreRequest(
      { ...examplePost, path: '/trigger/events/death/actions/REGISTER' },
      findExampleKey,
      EXAMPLE_CREATED_MS
    )
    expect(result.valid).toBe(false)
  })

  it('rejects a signed request sent with a different method', async () => {
    const result = await verifyCoreRequest(
      { ...exampleGet, method: 'DELETE' },
      findExampleKey,
      EXAMPLE_CREATED_MS
    )
    expect(result.valid).toBe(false)
  })

  it('rejects a signed request sent with a query that was not signed', async () => {
    const result = await verifyCoreRequest(
      { ...exampleGet, query: '?all=true' },
      findExampleKey,
      EXAMPLE_CREATED_MS
    )
    expect(result.valid).toBe(false)
  })

  it.each([
    ['accepts', '300 seconds old', 300, true],
    ['rejects', '301 seconds old', 301, false],
    ['accepts', '300 seconds in the future', -300, true],
    ['rejects', '301 seconds in the future', -301, false]
  ])('%s a signature that is %s', async (_, __, ageSeconds, valid) => {
    const result = await verifyCoreRequest(
      exampleGet,
      findExampleKey,
      EXAMPLE_CREATED_MS + ageSeconds * 1000
    )
    expect(result.valid).toBe(valid)
  })

  it('rejects a keyid that has no published key', async () => {
    const result = await verifyCoreRequest(
      exampleGet,
      keysById({}),
      EXAMPLE_CREATED_MS
    )
    expect(result).toEqual({
      valid: false,
      reason: REJECTION.UNKNOWN_KEYID
    })
  })

  it('rejects a request signed with a private key that is not published', async () => {
    const { privateKey } = generateKeyPairSync('ed25519')
    const request = {
      ...exampleGet,
      headers: asReceived(
        signCoreRequest({
          method: 'GET',
          path: '/config/events',
          key: { privateKey, keyid: EXAMPLE_KEYID },
          now: EXAMPLE_CREATED_MS
        })
      )
    }

    const result = await verifyCoreRequest(
      request,
      findExampleKey,
      EXAMPLE_CREATED_MS
    )
    expect(result).toEqual({
      valid: false,
      reason: REJECTION.WRONG_SIGNATURE
    })
  })

  it.each([
    ['another label', EXAMPLE_SIGNATURE_INPUT.replace(/^core=/, 'other=')],
    ['fewer components', EXAMPLE_SIGNATURE_INPUT.replace(' "@query"', '')],
    [
      'another algorithm',
      EXAMPLE_SIGNATURE_INPUT.replace('ed25519', 'rsa-v1_5-sha256')
    ],
    [
      'another tag',
      EXAMPLE_SIGNATURE_INPUT.replace('opencrvs-core-request', 'other')
    ]
  ])('rejects a Signature-Input with %s', async (_, signatureInput) => {
    const result = await verifyCoreRequest(
      withHeader(exampleGet, 'signature-input', signatureInput),
      findExampleKey,
      EXAMPLE_CREATED_MS
    )
    expect(result.valid).toBe(false)
  })
})

describe('signCoreRequest', () => {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519')
  const findKey = keysById({ 'test-key': publicKey })
  const now = Date.UTC(2026, 10, 3, 12)

  it('produces the example headers for the example request', () => {
    const headers = signCoreRequest({
      method: 'get',
      path: '/config/events',
      key: { privateKey, keyid: EXAMPLE_KEYID },
      now: EXAMPLE_CREATED_MS
    })

    expect(headers['Content-Digest']).toBe(exampleGet.headers['content-digest'])
    expect(headers['Signature-Input']).toBe(EXAMPLE_SIGNATURE_INPUT)
    expect(headers.Signature).toMatch(/^core=:[A-Za-z0-9+/]+={0,2}:$/)
  })

  it('signs a request with a body and a query that verifies', async () => {
    const body = JSON.stringify({ name: 'Ẹ̀kọ́' })
    const headers = signCoreRequest({
      method: 'POST',
      path: '/trigger/user/user-created',
      query: '?lang=yo',
      body,
      key: { privateKey, keyid: 'test-key' },
      now
    })

    const result = await verifyCoreRequest(
      {
        method: 'POST',
        path: '/trigger/user/user-created',
        query: '?lang=yo',
        rawBody: Buffer.from(body),
        headers: asReceived(headers)
      },
      findKey,
      now
    )
    expect(result).toEqual({ valid: true, keyid: 'test-key' })
  })
})

describe('withCoreSignature', () => {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519')
  const key = { privateKey, keyid: 'test-key' }
  const findKey = keysById({ 'test-key': publicKey })

  function received(url: string, init: RequestInit): CoreRequest {
    const { pathname, search } = new URL(url)
    return {
      method: init.method ?? 'GET',
      path: pathname,
      query: search,
      rawBody: Buffer.from((init.body as string | undefined) ?? ''),
      headers: Object.fromEntries(
        Object.entries(init.headers as Record<string, string>).map(
          ([name, value]) => [name.toLowerCase(), value]
        )
      )
    }
  }

  it('signs a GET to the URL it is sent to, including its query', async () => {
    const url = 'http://countryconfig:3040/config/events?lang=en'
    const init = withCoreSignature(key, url)

    expect(await verifyCoreRequest(received(url, init), findKey)).toEqual({
      valid: true,
      keyid: 'test-key'
    })
  })

  it('signs a POST body and keeps the other headers', async () => {
    const url = new URL('http://countryconfig:3040/trigger/user/2fa')
    const init = withCoreSignature(key, url, {
      method: 'POST',
      body: JSON.stringify({ code: '123456' }),
      headers: { 'Content-Type': 'application/json' }
    })

    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' })
    expect(
      await verifyCoreRequest(received(url.toString(), init), findKey)
    ).toEqual({ valid: true, keyid: 'test-key' })
  })

  it('signs the path as fetch sends it, after URL normalisation', async () => {
    const init = withCoreSignature(
      key,
      'http://countryconfig:3040/config/../config/events'
    )

    expect(
      await verifyCoreRequest(
        received('http://countryconfig:3040/config/events', init),
        findKey
      )
    ).toEqual({ valid: true, keyid: 'test-key' })
  })
})
