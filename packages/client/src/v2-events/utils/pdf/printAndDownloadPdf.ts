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
import pdfMake from 'pdfmake/build/pdfmake'
import { TDocumentDefinitions, TFontFamilyTypes } from 'pdfmake/interfaces'
import { isMobileDevice } from '@client/utils/commonUtils'

export interface PdfTemplate {
  definition: TDocumentDefinitions
  fonts: Record<string, TFontFamilyTypes>
}

export interface SvgTemplate {
  definition: string
}

export function printAndDownloadPdf(
  template: PdfTemplate,
  declarationId: string
) {
  const pdf = pdfMake.createPdf(template.definition, undefined, template.fonts)
  if (isMobileDevice()) {
    pdf.download(`${declarationId}`)
  } else {
    pdf.print()
  }
}
