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


import { Request } from '@hapi/hapi'
import { getAuthHeader, IAuthHeader } from '@opencrvs/commons'

function getDataSources(contextValue: Context) {
  return {
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
