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
import fetch from 'node-fetch'
import { env } from '@countryconfig/environment'
import { logger } from '@countryconfig/logger'

interface JWTPayload {
  exp?: number
  iat?: number
  [key: string]: any
}

interface TokenCache {
  token: string | null
  expiry: number
}

interface TokenResponse {
  token?: string
  access_token?: string
  expires_in?: number
  message?: string
}

interface TokenCacheManager {
  get: () => TokenCache
  set: (token: string, expiresIn?: number) => void
  clear: () => void
}

const FIVE_MINUTES_MS = 300000
const DEFAULT_TOKEN_EXPIRY_SECONDS = 3600

/**
 * Decodes a JWT token and extracts the payload
 * @param token - The JWT token string
 * @returns The decoded payload object
 */
const decodeJWT = (token: string): JWTPayload => {
  try {
    const base64Payload = token.split('.')[1]
    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8')
    return JSON.parse(payload)
  } catch (error) {
    logger.error('Failed to decode JWT token:', error)
    throw new Error('Invalid JWT token format')
  }
}

/**
 * Extracts expiration time from JWT token
 * @param token - The JWT token string
 * @returns Expiration timestamp in milliseconds, or null if not found
 */
const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = decodeJWT(token)
    if (payload.exp) {
      // JWT exp is in seconds, convert to milliseconds
      return payload.exp * 1000
    }
    logger.warn('JWT token does not contain exp claim')
    return null
  } catch (error) {
    logger.error('Failed to extract token expiry:', error)
    return null
  }
}

/**
 * Creates a token cache with getter and setter functions
 */
const createTokenCache = (): TokenCacheManager => {
  let cache: TokenCache = { token: null, expiry: 0 }

  return {
    get: () => cache,
    set: (token: string, expiresIn?: number) => {
      // Try to get expiration from JWT first
      const jwtExpiry = getTokenExpiry(token)

      let expiryTime: number
      if (jwtExpiry) {
        // Use JWT expiration time
        expiryTime = jwtExpiry
        logger.info(
          `Token expiry set from JWT: ${new Date(jwtExpiry).toISOString()}`
        )
      } else if (expiresIn) {
        // Fall back to expires_in from response
        expiryTime = Date.now() + expiresIn * 1000
        logger.info(`Token expiry set from expires_in: ${expiresIn} seconds`)
      } else {
        // Use default expiry
        expiryTime = Date.now() + DEFAULT_TOKEN_EXPIRY_SECONDS * 1000
        logger.info(
          `Token expiry set to default: ${DEFAULT_TOKEN_EXPIRY_SECONDS} seconds`
        )
      }

      cache = {
        token,
        expiry: expiryTime
      }
    },
    clear: () => {
      cache = { token: null, expiry: 0 }
    }
  }
}

/**
 * Checks if a cached token is still valid (with 5-minute buffer)
 */
const isTokenValid = (cache: TokenCache): boolean =>
  cache.token !== null && Date.now() < cache.expiry - FIVE_MINUTES_MS

/**
 * Fetches a new authentication token from the gateway
 */
const fetchToken = async (
  clientId: string,
  clientSecret: string,
  apiBaseUrl: string
): Promise<TokenResponse> => {
  const authenticateResponse = await fetch(
    `${apiBaseUrl}/auth/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': `${clientId}-${Date.now()}`
      }
    }
  )

  const res: TokenResponse = await authenticateResponse.json()

  if (!authenticateResponse.ok) {
    throw new Error(
      `Failed to get token for system client: ${
        res.message || authenticateResponse.statusText
      }`
    )
  }

  return res
}

/**
 * Creates a system client for authenticating proxy requests to /api/ endpoints
 * Uses client credentials flow to obtain and cache access tokens
 */
const createSystemClient = () => {
  const cache = createTokenCache()

  const getToken = async (): Promise<string> => {
    const cachedToken = cache.get()

    // Return cached token if still valid
    if (isTokenValid(cachedToken)) {
      logger.debug('Returning cached token')
      return cachedToken.token!
    }

    // Log if token has expired
    if (cachedToken.token) {
      logger.info('Cached token has expired, fetching new token')
    }

    const CLIENT_ID = env.SYSTEM_CLIENT_ID
    const CLIENT_SECRET = env.SYSTEM_CLIENT_SECRET
    const API_BASE_URL = env.GATEWAY_URL

    if (!CLIENT_ID || !CLIENT_SECRET) {
      logger.warn(
        'SYSTEM_CLIENT_ID or SYSTEM_CLIENT_SECRET not configured. Skipping system authentication.'
      )
      throw new Error('System client credentials not configured')
    }

    logger.info('Fetching new system client token')

    try {
      const tokenResponse = await fetchToken(
        CLIENT_ID,
        CLIENT_SECRET,
        API_BASE_URL
      )

      const token = tokenResponse.token || tokenResponse.access_token
      if (!token) {
        throw new Error('No token received from authentication service')
      }

      // Pass expires_in to cache.set, but it will prefer JWT exp claim
      const expiresIn = tokenResponse.expires_in
      cache.set(token, expiresIn)

      logger.info('Successfully obtained and cached system client token')

      return token
    } catch (error) {
      logger.error('Failed to get system client token:', error)
      throw error
    }
  }

  const clearToken = (): void => {
    cache.clear()
  }

  return {
    getToken,
    clearToken
  }
}

// Export singleton instance
export const systemClient = createSystemClient()
