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
  findCompositionSection,
  findEntryFromBundle,
  getComposition,
  RelatedPerson,
  updateFHIRBundle
} from '@opencrvs/commons/types'
import {
  correctionDetails,
  RECORD_WITH_MOTHER_AS_INFORMANT
} from '@test/mocks/correctBirthRecord'
import { EVENT_TYPE } from '@workflow/features/registration/fhir/constants'

describe('Record correction when informant changed from mother -> brother', () => {
  const updatedRecord = updateFHIRBundle(
    RECORD_WITH_MOTHER_AS_INFORMANT,
    correctionDetails,
    EVENT_TYPE.BIRTH
  )

  it('should not refer to mother as informant from composition', async () => {
    const composition = getComposition(updatedRecord)
    const motherSection = findCompositionSection('mother-details', composition)
    const informantSection = findCompositionSection(
      'informant-details',
      composition
    )
    const relatedPersonSectionEntry = informantSection?.entry[0]
    const relatedPerson =
      relatedPersonSectionEntry &&
      findEntryFromBundle<RelatedPerson>(
        updatedRecord,
        relatedPersonSectionEntry?.reference
      )?.resource
    expect(relatedPerson?.patient?.reference).not.toEqual(
      motherSection?.entry[0].reference
    )
  })

  it('should refer to a new patient resource from RelatedPerson', async () => {
    const composition = getComposition(updatedRecord)
    const informantSection = findCompositionSection(
      'informant-details',
      composition
    )
    const relatedPersonSectionEntry = informantSection?.entry[0]
    const relatedPerson =
      relatedPersonSectionEntry &&
      findEntryFromBundle<RelatedPerson>(
        updatedRecord,
        relatedPersonSectionEntry?.reference
      )?.resource
    expect(
      relatedPerson?.patient?.reference.startsWith('urn:uuid')
    ).toBeTruthy()
  })
})
