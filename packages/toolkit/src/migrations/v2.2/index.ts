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
import { main as addTranslations } from '../add-translations'
import { main as readDeclarationThroughHelper } from './read-declaration-through-helper'
import { main as replaceIncompleteFlag } from './replace-incomplete-flag'

/**
 * Run the upgrade process for the country config in the current working
 * directory.
 */
export async function runUpgrade() {
  await readDeclarationThroughHelper()
  await replaceIncompleteFlag()
  await addTranslations('2.2')
}
