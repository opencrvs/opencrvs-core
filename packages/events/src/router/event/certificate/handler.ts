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
 * Raw HTTP handler for `GET /events/{eventId}/certificate`.
 *
 * This endpoint lives outside tRPC deliberately: tRPC (and trpc-to-openapi)
 * always wrap responses in JSON, but a certificate download needs to return the
 * PDF bytes directly with `Content-Type: application/pdf`. It still reuses the
 * app's auth (`createContext`) and the same `record.read` access check the tRPC
 * routes use (`assertUserCanAccessEvent`), so access control stays identical.
 */
import { IncomingMessage, ServerResponse } from 'http'
import { TRPCError } from '@trpc/server'
import { logger, UUID } from '@opencrvs/commons'
import { createContext } from '@events/context'
import { assertUserCanAccessEvent } from '@events/router/middleware'
import { renderEventCertificate } from '@events/service/certificates'

const CERTIFICATE_PATH = /^\/events\/([^/]+)\/certificate\/?$/

/**
 * If `req` is a certificate download request, returns the raw eventId segment
 * from the path; otherwise `null`. The segment is validated as a UUID in the
 * handler, not here.
 */
export function matchCertificateRequest(req: IncomingMessage): string | null {
  if (req.method !== 'GET' || !req.url) {
    return null
  }
  const url = new URL(req.url, `http://${req.headers.host}`)
  const match = CERTIFICATE_PATH.exec(url.pathname)
  return match ? match[1] : null
}

const HTTP_STATUS_BY_TRPC_CODE: Partial<Record<TRPCError['code'], number>> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404
}

function trpcCodeToHttpStatus(code: TRPCError['code']): number {
  return HTTP_STATUS_BY_TRPC_CODE[code] ?? 500
}

function respondError(
  res: ServerResponse,
  status: number,
  message: string
): void {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: message }))
}

/**
 * Authenticate, authorize, render, and stream the certificate PDF. `eventId` is
 * the raw path segment produced by {@link matchCertificateRequest}.
 */
export async function handleCertificateRequest(
  req: IncomingMessage,
  res: ServerResponse,
  eventId: string
): Promise<void> {
  try {
    const { token, user } = await createContext({ req })
    if (!token || !user) {
      respondError(res, 401, 'Unauthorized')
      return
    }

    const parsedEventId = UUID.safeParse(eventId)
    if (!parsedEventId.success) {
      respondError(res, 400, 'Invalid event id')
      return
    }

    const url = new URL(req.url ?? '', `http://${req.headers.host}`)
    const templateId = url.searchParams.get('templateId') ?? undefined

    // Same access control as the tRPC record routes.
    const { eventType } = await assertUserCanAccessEvent({
      token,
      user,
      eventId: parsedEventId.data,
      scopes: ['record.read']
    })

    const pdf = await renderEventCertificate({
      eventId: parsedEventId.data,
      eventType,
      token,
      templateId
    })

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length,
      'Content-Disposition': `inline; filename="${parsedEventId.data}.pdf"`
    })
    res.end(pdf)
  } catch (error) {
    if (error instanceof TRPCError) {
      respondError(res, trpcCodeToHttpStatus(error.code), error.message)
      return
    }
    logger.error(
      `Failed to render certificate for event ${eventId}: ${String(error)}`
    )
    respondError(res, 500, 'Failed to render certificate')
  }
}
