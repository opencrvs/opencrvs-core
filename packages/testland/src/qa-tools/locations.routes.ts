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
import * as Hapi from '@hapi/hapi'
import { QaEntityConfig, renderQaToolPage } from './qa-tool-page'
import { createEntityWriteRoutes } from './write-proxy-routes'

const LOCATIONS_CONFIG: QaEntityConfig = {
  pluralLabel: 'locations',
  singularLabel: 'location',
  idLabel: 'Location id',
  basePath: 'locations',
  identityFields: [
    {
      name: 'administrativeAreaId',
      label: 'Administrative area id',
      nullable: true
    },
    { name: 'locationType', label: 'Location type' }
  ],
  otherPage: { label: 'administrative areas', path: '/administrative-areas' }
}

export function getLocationsQaRoutes(): Hapi.ServerRoute[] {
  return [
    {
      method: 'GET',
      path: '/locations',
      handler: (_request, h) =>
        h.response(renderQaToolPage(LOCATIONS_CONFIG)).type('text/html'),
      options: {
        auth: false,
        tags: ['qa-tool', 'locations'],
        description: 'QA tool page for exercising the location write APIs'
      }
    },
    ...createEntityWriteRoutes(LOCATIONS_CONFIG.basePath)
  ]
}
