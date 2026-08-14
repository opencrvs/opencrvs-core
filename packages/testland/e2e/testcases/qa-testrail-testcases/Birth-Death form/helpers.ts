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

/*
 * Local copy of e2e/utils.ts's selectLocationOption, scoped to this folder
 * only (not editing the shared utils.ts). The shared version's plain
 * getByText(locationName) does a substring match, which is ambiguous for
 * "Ibombo" - it also matches the option list's "Ibombo-north (old)" and
 * "Ibombo-south (new)" entries, causing a strict-mode violation. This
 * version disambiguates with an exact match.
 */
export async function selectLocationOption(page: Page, locationName: string) {
  await page
    .locator('[id^="locationOption"]')
    .getByText(locationName, { exact: true })
    .click()
}
