import { ICertificateCorrectorDefinition } from '@client/views/CorrectionForm/VerifyCorrector'
import { EventType } from '@client/utils/gateway'

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
const verifyBirthCorrector: ICertificateCorrectorDefinition = {
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
    birthDateField: 'informantBirthDate',
    ageOfPerson: 'ageOfIndividualInYears',
    nationalityField: 'nationality'
  },
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
    ageOfPerson: 'ageOfIndividualInYears',
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
    ageOfPerson: 'ageOfIndividualInYears',
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
    birthDateField: 'childBirthDate',
    ageOfPerson: 'ageOfIndividualInYears'
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
    birthDateField: 'informantBirthDate',
    ageOfPerson: 'ageOfIndividualInYears',
    nationalityField: 'nationality'
  }
}

export const getVerifyCorrectorDefinition = (event: EventType) =>
  event === EventType.Birth ? verifyBirthCorrector : verifyDeathCorrector
