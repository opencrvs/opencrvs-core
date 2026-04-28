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
import { main as removeReviewFromRegisterAction } from './remove-review-from-register-action'
import { main as makeBuiltInValidateActionsCustom } from './make-built-in-validate-actions-custom'
import { main as removeDeleteActions } from './remove-delete-actions'
import { main as convertParagraphToHeading } from './convert-paragraph-to-heading'
import { main as migrateValidatedWorkqueueStatusToFlag } from './migrate-validated-workqueue-status-to-flag'
import { main as addBirthCertificateIssuanceFlag } from './add-birth-certificate-issuance-flag'
import { main as removePendingCertificationFlag } from './remove-pending-certification-flag'
import { main as renameLocationParentId } from './rename-location-parent-id'
import { main as renameApiPaths } from './rename-api-paths'
import { main as convertConfigFilesToTs } from './convert-config-files-to-ts'
import { main as migrateScopes } from './migrate-scopes'
import { main as removeDeprecatedImports } from './remove-deprecated-imports'
import { main as migrateWorkqueueConfigs } from './migrate-workqueue-configs'
import { main as removeDemoScope } from './remove-demo-scope'
import { main as removeHearthMigrations } from './remove-hearth-migrations'
import { main as createEventsIndex } from './create-events-index'
import { main as checkoutUpstreamFiles } from './checkout-upstream-files'
import { main as simplifyAnalyticsPrecalculations } from './simplify-analytics-precalculations'
import { main as mergeInfrastructureDirectory } from './merge-infrastructure-directory'
import { main as deleteInfrastructureDirectory } from './delete-infrastructure-directory'

/**
 * Run the upgrade process for the country config in the current working
 * directory.
 *
 * @param dockerSwarm - When true, the local `infrastructure/` directory is
 *   merged with upstream changes (Docker Swarm deployments still need it).
 *   When false (the default), `infrastructure/` is deleted entirely, since
 *   non-Swarm deployments no longer ship it.
 */
export async function runUpgrade(dockerSwarm: boolean) {
  await migrateWorkqueueConfigs()
  await removeReviewFromRegisterAction()
  await makeBuiltInValidateActionsCustom()
  await removeDeleteActions()
  await convertParagraphToHeading()
  await migrateValidatedWorkqueueStatusToFlag()
  await addBirthCertificateIssuanceFlag()
  await removePendingCertificationFlag()
  await renameLocationParentId()
  await renameApiPaths()
  await convertConfigFilesToTs()
  await migrateScopes()
  await removeDeprecatedImports()
  await removeDemoScope()
  await removeHearthMigrations()
  await createEventsIndex()
  await checkoutUpstreamFiles()
  await simplifyAnalyticsPrecalculations()

  if (dockerSwarm) {
    await mergeInfrastructureDirectory()
  } else {
    await deleteInfrastructureDirectory()
  }
}
