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
import { vi } from 'vitest'
import {
  resetServer as resetMongoServer,
  setupServer as setupMongoServer
} from './storage/__mocks__/mongodb'

import {
  resetServer as resetESServer,
  setupServer as setupESServer
} from './storage/__mocks__/elasticsearch'

vi.mock('@events/storage/mongodb')
vi.mock('@events/storage/elasticsearch')

beforeAll(() => Promise.all([setupMongoServer(), setupESServer()]), 100000)
afterEach(() => Promise.all([resetMongoServer(), resetESServer()]))
