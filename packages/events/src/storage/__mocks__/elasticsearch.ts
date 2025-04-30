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
import * as elasticsearch from '@elastic/elasticsearch'
import { inject, vi } from 'vitest'

/** @knipignore */
export const getEventIndexName = vi.fn()
/** @knipignore */
export const getEventAliasName = vi.fn()

export function getOrCreateClient() {
  return new elasticsearch.Client({
    node: `http://${inject('ELASTICSEARCH_URI')}`
  })
}
