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
import bindingsYaml from '../../forms/bindings.yml'
import scannedPaths from '../generated/file-paths.json'
import type { Bindings } from './bindings'
import type { ScannedPaths } from './read'

// forms/bindings.yml as compiled by Vite, and the paths found by scripts/check-bindings.ts.
export const bindings = bindingsYaml as unknown as Bindings
export const scanned = scannedPaths as unknown as ScannedPaths
