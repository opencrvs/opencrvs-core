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
import { main as addExplicitCorrectionFlags } from './add-explicit-correction-flags'
import { main as addRecoveryLinkNotifications } from './add-recovery-link-notifications'
import { main as addTranslations } from './add-translations'
import { main as enableTelemetry } from './enable-telemetry'
import { main as renameTriggerPaths } from './rename-trigger-paths'

/**
 * Run the upgrade process for the country config in the current working
 * directory.
 */
export async function runUpgrade(dockerSwarm: boolean) {
  await addExplicitCorrectionFlags()
  await renameTriggerPaths()
  await addRecoveryLinkNotifications()
  await addTranslations()
  await enableTelemetry()
}
