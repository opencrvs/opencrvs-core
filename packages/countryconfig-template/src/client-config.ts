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
import { defineClientConfig } from '@opencrvs/toolkit/application-config'

export default defineClientConfig({
  // Country code in uppercase ALPHA-3 format
  COUNTRY: 'FAR',
  LANGUAGES: ['en', 'fr'],
  SENTRY: '',
  REGISTER_BACKGROUND: { backgroundColor: '36304E' },
  DASHBOARDS: [
    {
      id: 'registrations',
      title: {
        id: 'dashboard.registrationsTitle',
        defaultMessage: 'Registrations Dashboard',
        description: 'Menu item for registrations dashboard'
      },
      url: 'http://localhost:4444/public/dashboard/03be04d6-bde0-4fa7-9141-21cea2a7518b#bordered=false&titled=false&refresh=300'
    },
    {
      id: 'completeness',
      title: {
        id: 'dashboard.completenessTitle',
        defaultMessage: 'Completeness Dashboard',
        description: 'Menu item for completeness dashboard'
      },
      url: 'http://localhost:4444/public/dashboard/41940907-8542-4e18-a05d-2408e7e9838a#bordered=false&titled=false&refresh=300'
    },
    {
      id: 'registry',
      title: {
        id: 'dashboard.registryTitle',
        defaultMessage: 'Registry',
        description: 'Menu item for registry dashboard'
      },
      url: 'http://localhost:4444/public/dashboard/dc66b77a-79df-4f68-8fc8-5e5d5a2d7a35#bordered=false&titled=false&refresh=300'
    }
  ],
  FEATURES: {}
})