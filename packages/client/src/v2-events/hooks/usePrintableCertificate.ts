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

import {
  ApplicationConfigSchema,
  CertificateDataSchema,
  LanguageSchema
} from '@opencrvs/commons/events'
import {
  ActionFormData,
  EventDocument,
  isMinioUrl
} from '@opencrvs/commons/client'
import { fetchImageAsBase64 } from '@client/utils/imageUtils'
import { addFontsToSvg, compileSvg, svgToPdfTemplate } from './utils/PDFUtils'
import { printPDF } from '@client/pdfRenderer'

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

export const usePrintableCertificate = (
  event: EventDocument,
  form: ActionFormData,
  certificateConfig?: CertificateDataSchema,
  language?: LanguageSchema
) => {
  if (!language || !certificateConfig) {
    return { svgCode: null }
  }

  const isPrintInAdvance = false
  const canUserEditRecord = true
  const handleEdit = () => {}

  if (!certificateConfig) {
    return { svgCode: null }
  }
  const certificateFonts = certificateConfig.fonts ?? {}
  const svgWithoutFonts = compileSvg(certificateConfig.svg, form, language)
  const svgCode = addFontsToSvg(svgWithoutFonts, certificateFonts)

  const handleCertify = async () => {
    const base64ReplacedTemplate = await replaceMinioUrlWithBase64(form)
    const svgWithoutFonts = compileSvg(
      certificateConfig.svg,
      { ...base64ReplacedTemplate, preview: false },
      language
    )
    const svgWithFonts = addFontsToSvg(svgWithoutFonts, certificateFonts)
    const pdfTemplate = svgToPdfTemplate(svgWithFonts, certificateFonts)
    printPDF(pdfTemplate, event.id)
  }
  return {
    svgCode,
    handleCertify,
    isPrintInAdvance,
    canUserEditRecord,
    handleEdit
  }
}
