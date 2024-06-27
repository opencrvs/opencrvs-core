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

const SEARCH_URL = process.env.SEARCH_URL || 'http://localhost:9090/'

/**
 * Streams MongoDB collections to ElasticSearch documents. Useful when the ElasticSearch schema changes.
 */
const triggerReindex = async () => {
  const response = await fetch(new URL('reindex', SEARCH_URL), {
    method: 'POST'
  })

  if (!response.ok) {
    throw new Error(
      `Problem reindexing ElasticSearch. Response: ${await response.text()}`
    )
  }

  const data = await response.json()
  return data.jobId
}

/**
 * Checks the status of the reindex, as it can take a while
 */
const checkReindexStatus = async (jobId: string) => {
  const response = await fetch(new URL(`reindex/status/${jobId}`, SEARCH_URL), {
    method: 'GET'
  })

  if (!response.ok) {
    throw new Error(
      `Problem checking reindex status from ElasticSearch. Response: ${await response.text()}`
    )
  }

  const data = await response.json()
  return data.status === 'completed'
}

async function main() {
  console.info(`Reindexing search...`)
  const jobId = await triggerReindex()
  await new Promise<void>((resolve, reject) => {
    const intervalId = setInterval(async () => {
      try {
        const isCompleted = await checkReindexStatus(jobId)
        if (isCompleted) {
          clearInterval(intervalId)
          resolve()
        }
      } catch (error) {
        clearInterval(intervalId)
        reject(error)
      }
    }, 1000)
  })
  console.info(`...done reindexing search with job id ${jobId}`)
}

main()
