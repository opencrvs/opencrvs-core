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

const EVENTS = process.env.EVENTS_URL || 'http://localhost:5555/'

/**
 * Streams MongoDB collections to ElasticSearch documents. Useful when the ElasticSearch schema changes.
 */
const triggerReindex = async () => {
  const response = await fetch(new URL('/events/reindex', EVENTS), {
    method: 'POST'
  })

  if (!response.ok) {
    throw new Error(
      `Problem reindexing ElasticSearch. Response: ${await response.text()}`
    )
  }

  return response
}

async function main() {
  console.info(`Reindexing search...`)
  await triggerReindex()
  console.info(`...done reindexing}`)
}

main()
