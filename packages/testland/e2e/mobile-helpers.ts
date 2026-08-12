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

export const MOBILE_VIEWPORT_SIZE = { height: 800, width: 360 }

export async function setMobileViewport(page: Page) {
  await page.setViewportSize(MOBILE_VIEWPORT_SIZE)
}

export function isMobile(page: Page) {
  const width = page.viewportSize()?.width
  return width ? width <= MOBILE_VIEWPORT_SIZE.width : false
}
