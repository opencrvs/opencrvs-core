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

import MetricsAPI from '@gateway/features/fhir/metricsAPI'
import { UsersAPI } from '@gateway/features/user/usersAPI'
import { Request } from '@hapi/hapi'
import { getAuthHeader, IAuthHeader } from '@opencrvs/commons'
import CountryConfigAPI from '@gateway/features/fhir/countryConfigAPI'
import DocumentsAPI from '@gateway/features/fhir/documentsAPI'
import FHIRAPI from '@gateway/features/fhir/FHIRAPI'
import LocationsAPI from '@gateway/features/fhir/locationsAPI'
import MinioAPI from '@gateway/features/fhir/minioAPI'
import PaymentsAPI from '@gateway/features/fhir/paymentsAPI'
import RecordsAPI from '@gateway/features/fhir/recordsAPI'

function getDataSources(contextValue: Context) {
  return {
    documentsAPI: new DocumentsAPI({ contextValue }),
    paymentsAPI: new PaymentsAPI({ contextValue }),
    locationsAPI: new LocationsAPI({ contextValue }),
    countryConfigAPI: new CountryConfigAPI({ contextValue }),
    usersAPI: new UsersAPI({ contextValue }),
    fhirAPI: new FHIRAPI({ contextValue }),
    minioAPI: new MinioAPI({ contextValue }),
    metricsAPI: new MetricsAPI({ contextValue }),
    recordsAPI: new RecordsAPI()
  }
}

export class Context {
  public dataSources: ReturnType<typeof getDataSources>
  public request: Request
  public headers: IAuthHeader
  public presignDocumentUrls = true

  constructor(request: Request) {
    this.dataSources = getDataSources(this)
    this.request = request
    this.headers = getAuthHeader(request)
  }
}
