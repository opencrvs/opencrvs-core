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

import { formatLongDate } from '@client/utils/date-formatting'
import { EventType } from '@client/utils/gateway'
import { getLocationHierarchy } from '@client/utils/locationUtils'
import { getUserName, UserDetails } from '@client/utils/userUtils'
import { cloneDeep } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addFontsToSvg, compileSvg, svgToPdfTemplate } from './utils/PDFUtils'
import {
  calculatePrice,
  getEventDate,
  getRegisteredDate,
  isCertificateForPrintInAdvance
} from './utils/certificateUtils'
import { CertificateDataSchema } from '@opencrvs/commons/events'
import { ActionFormData, isMinioUrl } from '@opencrvs/commons/client'
import { fetchImageAsBase64 } from '@client/utils/imageUtils'
import { useAppConfig } from '@client/v2-events/hooks/useAppConfig'
import { useEffect } from 'react'
import { api } from '../trpc'

async function replaceMinioUrlWithBase64(template: Record<string, any>) {
  async function recursiveTransform(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    const transformedObject = Array.isArray(obj) ? [...obj] : { ...obj }

    for (const key in obj) {
      const value = obj[key]
      if (typeof value === 'string' && isMinioUrl(value)) {
        transformedObject[key] = await fetchImageAsBase64(value)
      } else if (typeof value === 'object') {
        transformedObject[key] = await recursiveTransform(value)
      } else {
        transformedObject[key] = value
      }
    }

    return transformedObject
  }
  return recursiveTransform(template)
}

export const usePrintableCertificate = (form: ActionFormData) => {
  const handleCertify = () => {}

  const isPrintInAdvance = false
  const canUserEditRecord = false
  const handleEdit = () => {}
  const { data: svgCode, isFetched } =
    api.appConfig.getCertificateTemplateSVGById.useQuery({
      id: form['collector.certificateTemplateId'] as string
    })

  return {
    isLoadingInProgress: isFetched,
    svgCode,
    handleCertify,
    isPrintInAdvance,
    canUserEditRecord,
    handleEdit
  }
}
