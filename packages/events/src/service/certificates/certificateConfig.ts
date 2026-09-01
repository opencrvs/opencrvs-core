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

/**
 * Fetches everything the render engine needs from country-config: the list of
 * certificate configurations, the SVG template body, and the font files as
 * buffers. Country-config can be deployed independently of the events service,
 * so all of this is fetched over HTTP rather than read from disk.
 */
import fetch from 'node-fetch'
import { array } from 'zod'
import {
  CertificateConfig,
  getOrThrow,
  TokenWithBearer
} from '@opencrvs/commons'
import { env } from '@events/environment'
import type { FontDictionary, FontFamilyBuffers } from './renderCertificate'

/**
 * Certificate config URLs (svg, fonts) are authored for the browser and carry
 * the gateway prefix `/api/countryconfig`. Server-side we talk to country-config
 * directly, so rewrite those (and any other absolute path) onto
 * `COUNTRY_CONFIG_URL`. Absolute http(s) URLs are returned unchanged.
 */
function toCountryConfigUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl
  }
  const path = pathOrUrl.replace(/^\/api\/countryconfig/, '')
  return new URL(path, env.COUNTRY_CONFIG_URL).toString()
}

/** Fetch all certificate configurations from country-config. */
export async function getCertificateConfigs(
  token: TokenWithBearer
): Promise<CertificateConfig[]> {
  const res = await fetch(new URL('/certificates', env.COUNTRY_CONFIG_URL), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })

  if (!res.ok) {
    throw new Error(
      `Failed to fetch certificate configs: ${res.status} ${res.statusText}`
    )
  }

  return array(CertificateConfig).parse(await res.json())
}

/**
 * Select the certificate configuration to render.
 *
 * @param templateId - explicit certificate config `id`; when omitted, the
 *   default template for the event type is used.
 */
export function selectCertificateConfig(
  configs: CertificateConfig[],
  eventType: string,
  templateId?: string
): CertificateConfig {
  const forEvent = configs.filter((c) => c.event === eventType)
  const selected = templateId
    ? forEvent.find((c) => c.id === templateId)
    : (forEvent.find((c) => c.isDefault) ?? forEvent[0])

  return getOrThrow(
    selected,
    templateId
      ? `No certificate template '${templateId}' for event type '${eventType}'`
      : `No default certificate template for event type '${eventType}'`
  )
}

/** Fetch the raw SVG template body referenced by a certificate config. */
export async function fetchSvgTemplate(
  config: CertificateConfig,
  token: TokenWithBearer
): Promise<string> {
  const res = await fetch(toCountryConfigUrl(config.svgUrl), {
    headers: {
      'Content-Type': 'image/svg+xml',
      Authorization: token
    }
  })
  if (!res.ok) {
    throw new Error(
      `Failed to fetch certificate SVG '${config.svgUrl}': ${res.status} ${res.statusText}`
    )
  }
  return res.text()
}

async function fetchFontBuffer(url: string): Promise<Buffer> {
  const res = await fetch(toCountryConfigUrl(url))
  if (!res.ok) {
    throw new Error(`Failed to fetch font '${url}': ${res.status}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

/**
 * Resolve a certificate config's font URLs into in-memory buffers keyed by
 * family name — the shape pdfmake's `PdfPrinter` expects. Each distinct URL is
 * fetched once and reused across weights.
 */
export async function fetchFontDictionary(
  config: CertificateConfig
): Promise<FontDictionary> {
  const fonts = config.fonts ?? {}
  const cache = new Map<string, Promise<Buffer>>()
  const load = (url: string) => {
    const existing = cache.get(url)
    if (existing) {
      return existing
    }
    const promise = fetchFontBuffer(url)
    cache.set(url, promise)
    return promise
  }

  const families = await Promise.all(
    Object.entries(fonts).map(async ([family, weights]) => {
      const [normal, bold, italics, bolditalics] = await Promise.all([
        load(weights.normal),
        load(weights.bold),
        load(weights.italics),
        load(weights.bolditalics)
      ])
      const buffers: FontFamilyBuffers = { normal, bold, italics, bolditalics }
      return [family, buffers] as const
    })
  )

  return Object.fromEntries(families)
}
