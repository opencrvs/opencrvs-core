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

const ADMINISTRATIVE_AREAS_CONFIG: QaEntityConfig = {
  pluralLabel: 'administrative areas',
  singularLabel: 'administrative area',
  idLabel: 'Administrative area id',
  basePath: 'administrative-areas',
  identityFields: [{ name: 'parentId', label: 'Parent id', nullable: true }]
}

export function getAdministrativeAreasQaRoutes(): Hapi.ServerRoute[] {
  return [
    {
      method: 'GET',
      path: '/administrative-areas',
      handler: (_request, h) =>
        h
          .response(renderQaToolPage(ADMINISTRATIVE_AREAS_CONFIG))
          .type('text/html'),
      options: {
        auth: false,
        tags: ['qa-tool', 'administrative-areas'],
        description:
          'QA tool page for exercising the administrative area write APIs'
      }
    },
    ...createEntityWriteRoutes(ADMINISTRATIVE_AREAS_CONFIG.basePath)
  ]
}
