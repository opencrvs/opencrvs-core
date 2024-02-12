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
import { ResourceIdentifier, URNReference, Location } from '../fhir'

export type StringExtensionType = {
  'http://opencrvs.org/specs/extension/makeCorrection': {
    url: 'http://opencrvs.org/specs/extension/makeCorrection'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/markedAsDuplicate': {
    url: 'http://opencrvs.org/specs/extension/markedAsDuplicate'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/educational-attainment': {
    url: 'http://opencrvs.org/specs/extension/educational-attainment'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/age': {
    url: 'http://opencrvs.org/specs/extension/age'
    /**
     * @deprecated The field should not be used!
     * valueString seems to be either a string or a number
     */
    valueString?: string | number
    valueInteger?: number
  }
  'http://opencrvs.org/specs/extension/patient-occupation': {
    url: 'http://opencrvs.org/specs/extension/patient-occupation'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/reason-not-applying': {
    url: 'http://opencrvs.org/specs/extension/reason-not-applying'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/contact-person': {
    url: 'http://opencrvs.org/specs/extension/contact-person'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/contact-relationship': {
    url: 'http://opencrvs.org/specs/extension/contact-relationship'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/contact-person-phone-number': {
    url: 'http://opencrvs.org/specs/extension/contact-person-phone-number'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/contact-person-email': {
    url: 'http://opencrvs.org/specs/extension/contact-person-email'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/informants-signature': {
    url: 'http://opencrvs.org/specs/extension/informants-signature'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/groom-signature': {
    url: 'http://opencrvs.org/specs/extension/groom-signature'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/bride-signature': {
    url: 'http://opencrvs.org/specs/extension/bride-signature'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/witness-one-signature': {
    url: 'http://opencrvs.org/specs/extension/witness-one-signature'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/witness-two-signature': {
    url: 'http://opencrvs.org/specs/extension/witness-two-signature'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/requestingIndividual': {
    url: 'http://opencrvs.org/specs/extension/requestingIndividual'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/regVerified': {
    url: 'http://opencrvs.org/specs/extension/regVerified'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/regDownloaded': {
    url: 'http://opencrvs.org/specs/extension/regDownloaded'
    valueString?: string
  }
  'http://opencrvs.org/specs/extension/requestingIndividualOther': {
    url: 'http://opencrvs.org/specs/extension/requestingIndividualOther'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/flaggedAsPotentialDuplicate': {
    url: 'http://opencrvs.org/specs/extension/flaggedAsPotentialDuplicate'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/duplicateTrackingId': {
    url: 'http://opencrvs.org/specs/extension/duplicateTrackingId'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/in-complete-fields': {
    url: 'http://opencrvs.org/specs/extension/in-complete-fields'
    valueString: string
  }
  'http://opencrvs.org/specs/id/statistics-male-populations': {
    url: 'http://opencrvs.org/specs/id/statistics-male-populations'
    valueString: string
  }
  'http://opencrvs.org/specs/id/statistics-female-populations': {
    url: 'http://opencrvs.org/specs/id/statistics-female-populations'
    valueString: string
  }
  'http://opencrvs.org/specs/id/statistics-total-populations': {
    url: 'http://opencrvs.org/specs/id/statistics-total-populations'
    valueString: string
  }
  'http://opencrvs.org/specs/id/statistics-crude-birth-rates': {
    url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates'
    valueString: string
  }
  'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument': {
    url: 'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument'
    /**
     * @deprecated The field should not be used!
     */
    valueString?: string
    valueBoolean: boolean
  }
  'http://opencrvs.org/specs/extension/regLastOffice': {
    url: 'http://opencrvs.org/specs/extension/regLastOffice'
    valueReference: { reference: string }
    /**
     * Human readable office name
     */
    valueString?: string
  }
}

export type KnownExtensionType = StringExtensionType & {
  'http://opencrvs.org/specs/extension/regLastUser': {
    url: 'http://opencrvs.org/specs/extension/regLastUser'
    valueReference: {
      reference: ResourceIdentifier
    }
  }
  'http://opencrvs.org/specs/extension/collector': {
    url: 'http://opencrvs.org/specs/extension/collector'
    valueReference: {
      reference: ResourceIdentifier | URNReference /* Unsaved */
    }
  }
  'http://opencrvs.org/specs/extension/relatedperson-affidavittype': {
    url: 'http://opencrvs.org/specs/extension/relatedperson-affidavittype'
    valueAttachment: {
      contentType: string
      data: string
    }
  }
  'http://opencrvs.org/specs/extension/payment': {
    url: 'http://opencrvs.org/specs/extension/payment'
    valueReference: {
      reference: ResourceIdentifier | URNReference /* Unsaved */
    }
  }
  'http://opencrvs.org/specs/extension/date-of-marriage': {
    url: 'http://opencrvs.org/specs/extension/date-of-marriage'
    valueDateTime: string
  }
  'http://opencrvs.org/specs/extension/paymentDetails': {
    url: 'http://opencrvs.org/specs/extension/paymentDetails'
    valueReference: {
      reference: string
    }
  }
  'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson': {
    url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson'
    valueAttachment: {
      contentType: string
      data: string
    }
  }
  'http://opencrvs.org/specs/extension/timeLoggedMS': {
    url: 'http://opencrvs.org/specs/extension/timeLoggedMS'
    valueInteger: number
  }
  'http://opencrvs.org/specs/extension/age-of-individual-in-years': {
    url: 'http://opencrvs.org/specs/extension/age-of-individual-in-years'
    valueInteger: number
  }
  'http://opencrvs.org/specs/extension/noSupportingDocumentationRequired': {
    url: 'http://opencrvs.org/specs/extension/noSupportingDocumentationRequired'
    valueBoolean: boolean
  }
  'http://opencrvs.org/specs/extension/employee-signature': {
    url: 'http://opencrvs.org/specs/extension/employee-signature'
    valueSignature: {
      contentType: string
      when?: string
      type?: Array<{ system: string; code: string; display: string }>
      blob: string
    }
  }
  'http://opencrvs.org/specs/extension/regAssigned': {
    url: 'http://opencrvs.org/specs/extension/regAssigned'
  }
  'http://opencrvs.org/specs/extension/regReinstated': {
    url: 'http://opencrvs.org/specs/extension/regReinstated'
  }
  'http://opencrvs.org/specs/extension/regViewed': {
    url: 'http://opencrvs.org/specs/extension/regViewed'
  }
  'http://opencrvs.org/specs/extension/markedAsNotDuplicate': {
    url: 'http://opencrvs.org/specs/extension/markedAsNotDuplicate'
  }
  'http://opencrvs.org/specs/extension/regUnassigned': {
    url: 'http://opencrvs.org/specs/extension/regUnassigned'
  }
  'http://opencrvs.org/specs/extension/regLastLocation': {
    url: 'http://opencrvs.org/specs/extension/regLastLocation'
    valueReference: {
      reference: ResourceIdentifier<Location>
    }
  }
  'http://opencrvs.org/specs/extension/part-of': {
    url: 'http://opencrvs.org/specs/extension/part-of'
    valueReference: {
      reference: ResourceIdentifier<Location>
    }
  }
  'http://hl7.org/fhir/StructureDefinition/patient-nationality': {
    url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality'
    extension: Array<
      | {
          url: 'code'
          valueCodeableConcept: {
            coding: [{ system: string; code: string }]
          }
        }
      | {
          url: 'period'
          valuePeriod: {
            start: string
            end: string
          }
        }
    >
  }
}
export type StringExtension = { url: string; valueString: string }
export type Extension = KnownExtensionType[keyof KnownExtensionType]

type NestedExtensionTypes = Extract<
  Extension,
  { extension: any }
>['extension'][number]

type AllExtensions =
  | KnownExtensionType[keyof KnownExtensionType]
  | NestedExtensionTypes

export type StringValueExtension =
  StringExtensionType[keyof StringExtensionType]

export function findExtension<URL extends AllExtensions['url']>(
  url: URL,
  listOfExtensions: AllExtensions[]
): Extract<AllExtensions, { url: URL }> | undefined {
  return listOfExtensions.find(
    (extension): extension is Extract<AllExtensions, { url: URL }> =>
      extension.url === url
  )
}
