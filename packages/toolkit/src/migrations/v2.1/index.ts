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

export interface UpgradeResult {
  /**
   * Everything the upgrade could not do for the country config, gathered from
   * every codemod. Empty means the upgrade is genuinely complete.
   */
  outstanding: string[]
}

/**
 * Run the upgrade process for the country config in the current working
 * directory.
 *
 * Each codemod is best-effort: a country config that renamed or restructured
 * the files a codemod targets keeps its own structure, and the codemod records
 * what it could not do rather than guessing. Those records are collected here
 * so the caller can present one list of what is left, instead of the operator
 * having to notice individual warnings in the scrollback.
 */
export async function runUpgrade(): Promise<UpgradeResult> {
  const outstanding: string[] = []

  outstanding.push(...(await addExplicitCorrectionFlags()))
  outstanding.push(...(await addRecoveryLinkNotifications()))
  outstanding.push(...(await addTranslations()))
  outstanding.push(...(await enableTelemetry()))

  return { outstanding }
}
