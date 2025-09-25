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

const EVENTS = process.env.EVENTS_URL || 'http://localhost:5555/'
const AUTH = process.env.AUTH_URL || 'http://localhost:4040/'

export async function getReindexingToken() {
  const res = await fetch(
    new URL('/internal/reindexing-token', AUTH).toString()
  )
  const { token } = await res.json()
  return token as string
}

/**
 * Streams MongoDB collections to ElasticSearch documents. Useful when the ElasticSearch schema changes.
 */
const triggerReindex = async () => {
  const response = await fetch(new URL('/events/reindex', EVENTS), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getReindexingToken()}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(
      `Problem reindexing ElasticSearch. Response: ${await response.text()}`
    )
  }

  return response
}

let reindexingAttempts = 0
async function main() {
  console.info(
    `Reindexing search...${reindexingAttempts === 0 ? '' : ` (attempt ${reindexingAttempts})`}`
  )
  try {
    await triggerReindex()
  } catch (error) {
    reindexingAttempts++
    if (reindexingAttempts > 30) {
      console.error(
        `Failed to reindex search after ${reindexingAttempts} attempts. Error: ${error}`
      )
      process.exit(1)
    }
    setTimeout(main, 5000)
  }

  console.info('...done reindexing')
}

main()
