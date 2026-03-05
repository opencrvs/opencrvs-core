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

import { gql } from '@apollo/client'

// System listing is done via TRPC integrations.list (see useIntegrations.ts).
// The registerSystem mutation goes through Gateway which handles
// type-to-scopes conversion before calling the events service.
export const registerSystem = gql`
  mutation registerSystem($system: SystemInput) {
    registerSystem(system: $system) {
      clientId
      clientSecret
      shaSecret
    }
  }
`
