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

// eslint-disable-next-line import/no-relative-parent-imports
import { AugmentedRequest } from '@apollo/datasource-rest'
import { FHIR_URL } from '@gateway/constants'
import { OpenCRVSRESTDataSource } from '@gateway/graphql/data-source'
import { PaymentReconciliation } from '@opencrvs/commons/types'

export default class PaymentsAPI extends OpenCRVSRESTDataSource {
  override baseURL = FHIR_URL

  override willSendRequest(
    _path: string,
    request: AugmentedRequest
  ): void | Promise<void> {
    super.willSendRequest(_path, request)
    request.headers['Content-Type'] = 'application/fhir+json'
  }

  getPayment(id: string): Promise<PaymentReconciliation> {
    return this.get(`PaymentReconciliation/${id}`)
  }
}
