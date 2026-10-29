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
import { main as addTranslations } from './persistent/add-translations'
import { main as moveDeclarationToDeclareAction } from './move-declaration-to-declare-action'
import { main as addNotifyConfig } from './add-notify-config'
import { main as readDeclarationThroughHelper } from './read-declaration-through-helper'
import { main as updateToolkitDependency } from './persistent/update-toolkit-dependency'
import { main as replaceIncompleteFlag } from './replace-incomplete-flag'

/**
 * Run the upgrade process for the country config in the current working
 * directory.
 *
 * @param toolkitVersion the version of the toolkit running the upgrade, e.g.
 *   `2.2.0` or `2.2.0-rc.1`. The country config is upgraded to its major.minor.
 */
export async function runUpgrade(toolkitVersion: string) {
  const [major, minor] = toolkitVersion.split('.')

  await moveDeclarationToDeclareAction()
  // After moving `declaration` onto DECLARE, where it copies it from
  await addNotifyConfig()
  await readDeclarationThroughHelper()
  await addTranslations(`${major}.${minor}`)
  await replaceIncompleteFlag()
  // Last, so a failed upgrade leaves the version it upgrades from in place
  await updateToolkitDependency(toolkitVersion)
}
