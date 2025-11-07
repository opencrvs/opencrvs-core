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

import { generateOpenApiDocument } from 'trpc-to-openapi'
import * as yaml from 'yaml'
import { appRouter } from './router/router'

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'OpenCRVS API',
  version: '1.8.0',
  baseUrl: 'http://localhost:3000/api/events'
})

// eslint-disable-next-line no-console
console.log(yaml.stringify(openApiDocument))
