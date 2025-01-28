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

import { LanguageSchema, CertificateDataSchema } from '@opencrvs/commons/events'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'

interface IApplicationConfig {
  certificatesTemplate: CertificateDataSchema[]
  language?: LanguageSchema
}

export const useAppConfig = (): IApplicationConfig => {
  const offlineCountryConfig = useSelector(getOfflineData)

  return {
    language: offlineCountryConfig.languages[0],
    certificatesTemplate: offlineCountryConfig.templates.certificates
  }
}
