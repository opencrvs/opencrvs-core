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
/* eslint-disable import/no-relative-parent-imports */
import PatientAPI from '../features/fhir/patientAPI'
import { IAuthHeader } from '@opencrvs/commons'
import LocationsAPI from '../features/fhir/locationsAPI'
import PaymentsAPI from '../features/fhir/paymentsAPI'
import DocumentsAPI from '../features/fhir/documentsAPI'
import FHIRAPI from '../features/fhir/FHIRAPI'
import MinioAPI from '../features/fhir/minioAPI'
import { Request } from '@hapi/hapi'
import { Bundle, Saved } from '@opencrvs/commons/types'
import { UsersAPI } from '@gateway/features/user/usersAPI'
import MetricsAPI from '@gateway/features/fhir/metricsAPI'

export interface Context {
  request: Request
  record?: Saved<Bundle>
  presignDocumentUrls?: boolean
  dataSources: {
    locationsAPI: LocationsAPI
    documentsAPI: DocumentsAPI
    usersAPI: UsersAPI
    paymentsAPI: PaymentsAPI
    fhirAPI: FHIRAPI
    patientAPI: PatientAPI
    minioAPI: MinioAPI
    metricsAPI: MetricsAPI
  }
  headers: IAuthHeader
}
