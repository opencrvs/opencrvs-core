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
import { IFormField, IFormData } from '@client/forms'
import { attachmentToFieldTransformer } from '@client/forms/mappings/query/field-mappings'
import {
  deathDocumentForWhomFhirMapping,
  deathDocumentTypeFhirMapping
} from '@client/forms/register/fieldMappings/death/mutation/documents-mappings'

export const REGISTRATION_SECTION = 'registration'

const fieldNameMapping = {
  [deathDocumentForWhomFhirMapping.DECEASED_ID_PROOF]: 'uploadDocForDeceased',
  [deathDocumentForWhomFhirMapping.INFORMANT_ID_PROOF]: 'uploadDocForInformant',
  [deathDocumentForWhomFhirMapping.DECEASED_DEATH_PROOF]:
    'uploadDocForDeceasedDeath',
  [deathDocumentForWhomFhirMapping.DECEASED_DEATH_CAUSE_PROOF]:
    'uploadDocForCauseOfDeath'
}

export function deathAttachmentToFieldTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) {
  return attachmentToFieldTransformer(
    transformedData,
    queryData,
    sectionId,
    field,
    REGISTRATION_SECTION,
    deathDocumentForWhomFhirMapping,
    deathDocumentTypeFhirMapping,
    fieldNameMapping
  )
}
