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
import { main as addE2ETests } from './add-e2e-tests'
import { main as upgradeTilt } from './upgrade-tilt'

/**
 * Run the v2.1 -> v2.2 upgrade process for the country config in the current
 * working directory.
 */
export async function runUpgrade() {
  await upgradeTilt()
  await addE2ETests()
}
