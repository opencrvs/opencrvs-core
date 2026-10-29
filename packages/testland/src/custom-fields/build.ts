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
import path from 'path'
import * as esbuild from 'esbuild'
import { customFieldBuildOptions } from '@opencrvs/toolkit/custom-fields'

/** Served at /static/custom-fields/ */
export const CUSTOM_FIELDS_OUTDIR = path.join(
  __dirname,
  '../../build/custom-fields'
)

/**
 * Bundles each custom field into one ES module for the client.
 * esbuild takes less than a second, so the server does it when it starts.
 */
export async function buildCustomFields() {
  await esbuild.build(
    customFieldBuildOptions({
      entryPoints: {
        'skill-level': path.join(__dirname, 'skill-level/index.tsx')
      },
      outdir: CUSTOM_FIELDS_OUTDIR
    })
  )
}
