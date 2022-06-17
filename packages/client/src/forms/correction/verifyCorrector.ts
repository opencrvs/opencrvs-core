import { ICertificateCorrectorDefinition } from '@client/views/CorrectionForm/VerifyCorrector'
import { Event } from '@client/utils/gateway'

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
const verifyBirthCorrector: ICertificateCorrectorDefinition = {
  mother: {
    identifierTypeField: 'iDType',
    identifierOtherTypeField: 'iDTypeOther',
    identifierField: 'iD',
    nameFields: {
      en: {
        firstNamesField: 'firstNamesEng',
        familyNameField: 'familyNameEng'
      }
    },
    birthDateField: 'motherBirthDate',
    nationalityField: 'nationality'
  },
  father: {
    identifierTypeField: 'iDType',
    identifierOtherTypeField: 'iDTypeOther',
    identifierField: 'iD',
    nameFields: {
      en: {
        firstNamesField: 'firstNamesEng',
        familyNameField: 'familyNameEng'
      }
    },
    birthDateField: 'fatherBirthDate',
    nationalityField: 'nationality'
  },
  child: {
    identifierTypeField: 'iDType',
    identifierOtherTypeField: 'iDTypeOther',
    identifierField: 'iD',
    nameFields: {
      en: {
        firstNamesField: 'firstNamesEng',
        familyNameField: 'familyNameEng'
      }
    },
    birthDateField: 'childBirthDate'
  }
}

const verifyDeathCorrector: ICertificateCorrectorDefinition = {
  informant: {
    identifierTypeField: 'iDType',
    identifierOtherTypeField: 'iDTypeOther',
    identifierField: 'informantID',
    nameFields: {
      en: {
        firstNamesField: 'firstNamesEng',
        familyNameField: 'familyNameEng'
      }
    },
    nationalityField: 'nationality'
  }
}

export const getVerifyCorrectorDefinition = (event: Event) =>
  event === Event.Birth ? verifyBirthCorrector : verifyDeathCorrector
