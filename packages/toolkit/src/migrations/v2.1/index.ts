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
import { main as checkoutTemplateFiles } from './checkout-template-files'
import { main as enableTelemetry } from './enable-telemetry'
import { main as migrateToPnpm } from './migrate-to-pnpm'
import { main as moveInfrastructureToAssets } from './move-infrastructure-to-assets'
import { main as removeMetabasePackageInstalls } from './remove-metabase-package-installs'
import { main as removeSentry } from './remove-sentry'
import { main as renameTriggerPaths } from './rename-trigger-paths'
import { main as upgradeTilt } from './upgrade-tilt'

/**
 * Run the upgrade process for the country config in the current working
 * directory.
 *
 * @param dockerSwarm - When true, `infrastructure/` stays where it is (Docker
 *   Swarm deployments mount it) and only the Dockerfile is taken from the
 *   template. When false (the default), `infrastructure/` moves to `assets/`
 *   and the Dockerfiles and Tilt setup are taken from the template.
 */
export async function runUpgrade(dockerSwarm: boolean) {
  await addExplicitCorrectionFlags()
  await renameTriggerPaths()
  await addRecoveryLinkNotifications()
  await addTranslations()
  await removeSentry()
  await enableTelemetry()
  await removeMetabasePackageInstalls()

  if (!dockerSwarm) {
    await moveInfrastructureToAssets()
  }
  // The template's Dockerfiles and Tiltfile install with pnpm, so the switch
  // has to come first
  await migrateToPnpm()
  await checkoutTemplateFiles({ dockerSwarm })
}
