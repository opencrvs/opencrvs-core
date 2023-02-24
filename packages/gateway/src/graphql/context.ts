/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
/* eslint-disable import/no-relative-parent-imports */
import { IAuthHeader } from '../common-types'
import LocationsAPI from '../features/fhir/locationsAPI'
import PractitionerRoleAPI from '../features/fhir/practitionerRoleAPI'

export interface Context {
  dataSources: {
    locationsAPI: LocationsAPI
    practitionerRoleAPI: PractitionerRoleAPI
  }
  headers: IAuthHeader
}
