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
import { Page } from '@playwright/test'

export const NETWORK_CONDITIONS = {
  default: {
    offline: false,
    downloadThroughput: -1,
    uploadThroughput: -1,
    latency: 0
  },
  offline: {
    offline: true,
    downloadThroughput: 0,
    uploadThroughput: 0,
    latency: 0,
    connectionType: 'none'
  },
  cellular2G: {
    offline: false,
    downloadThroughput: (250 * 1024) / 8,
    uploadThroughput: (50 * 1024) / 8,
    latency: 300,
    connectionType: 'cellular2g'
  },
  cellular3G: {
    offline: false,
    downloadThroughput: (750 * 1024) / 8,
    uploadThroughput: (250 * 1024) / 8,
    latency: 100,
    connectionType: 'cellular3g'
  },
  cellular4G: {
    offline: false,
    downloadThroughput: (4 * 1024 * 1024) / 8,
    uploadThroughput: (3 * 1024 * 1024) / 8,
    latency: 20,
    connectionType: 'cellular4g'
  }
} as const

export async function mockNetworkConditions(
  page: Page,
  connection: keyof typeof NETWORK_CONDITIONS
) {
  const client = await page.context().newCDPSession(page)
  await client.send('Network.enable')
  await client.send(
    'Network.emulateNetworkConditions',
    NETWORK_CONDITIONS[connection]
  )
}

export async function restoreNetworkConditions(page: Page) {
  await mockNetworkConditions(page, 'default')
}
