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
import type { Bindings } from '../bindings/bindings'
import type { ScannedPaths } from '../bindings/read'
import { loadSnapshot, type Sources } from '../bindings/snapshot'
import type { RenderedFile } from '../local/port'
import { generateBackupSecrets } from './backupSecrets'
import { buildPlan, type Plan } from './plan'

export interface Review {
  plan: Plan
  files: RenderedFile[]
  // Set when the files could not be rendered; GitHub can still be written.
  filesError?: string
  // The answers on screen with secrets (for the plan) and without (for the files and the download).
  values: Record<string, unknown>
  publicValues: Record<string, unknown>
}

// Reads GitHub again, so the statuses describe it as it is now, and works out what would be written.
export async function prepareReview(input: {
  environment: string
  values: Record<string, unknown>
  publicValues: Record<string, unknown>
  sources: Sources
  bindings: Bindings
  scanned: ScannedPaths
}): Promise<Review> {
  const { environment, values, publicValues, sources, bindings, scanned } = input
  const snapshot = await loadSnapshot(environment, sources, bindings, scanned)
  // The backup secrets are made here, once GitHub has said which of them the environment has.
  const generated = await generateBackupSecrets(values, snapshot, sources.local)
  const plan = buildPlan({ environment, values, snapshot, bindings, generated })

  let files: RenderedFile[] = []
  let filesError: string | undefined
  try {
    files = await sources.local.renderFiles(environment, publicValues)
  } catch (error) {
    filesError = error instanceof Error ? error.message : 'unknown error'
  }
  return { plan, files, filesError, values, publicValues }
}

type FileStatus = 'new' | 'update' | 'unchanged' | 'not written'

// 'not written': the layout has no place for this file (the flat layout holds one file per environment).
export const fileStatus = (file: RenderedFile): FileStatus =>
  file.target === null ? 'not written' : file.existing === null ? 'new' : file.existing === file.text ? 'unchanged' : 'update'
