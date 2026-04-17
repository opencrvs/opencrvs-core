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

let cwd: string | undefined

export function getCwd() {
  if (!cwd) {
    throw new Error('Country config working directory not set.')
  }

  return cwd
}

/**
 * Run the upgrade process for a given country config directory.
 * @param ccwd - The country config working directory.
 */
export async function runUpgrade(ccwd: string | undefined) {
  if (ccwd) {
    console.log('Country config working directory:', ccwd)
    cwd = ccwd
  }
  if (!ccwd) {
    console.log(
      'Will use current working directory as country config working directory.'
    )
    cwd = process.cwd()
  }

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
}
