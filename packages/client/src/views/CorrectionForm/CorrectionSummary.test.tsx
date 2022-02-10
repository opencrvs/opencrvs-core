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
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockApplicationData,
  createRouterProps,
  getFileFromBase64String,
  validImageB64String,
  flushPromises
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { Event, CorrectionSection } from '@client/forms'
import { IApplication, storeApplication } from '@client/applications'
import { CorrectionForm } from './CorrectionForm'
import { formatUrl } from '@client/navigation'
import { CERTIFICATE_CORRECTION } from '@client/navigation/routes'

let wrapper: ReactWrapper<{}, {}>

const deathApplication: IApplication = {
  id: '85bccf72-6117-4cab-827d-47728becb0c1',
  data: {
    registration: {
      relationship: {
        value: 'SON',
        nestedFields: {
          otherRelationship: ''
        }
      },
      contactPoint: {
        value: 'APPLICANT',
        nestedFields: {
          registrationPhone: '0712345678',
          contactRelationship: ''
        }
      },
      _fhirID: '7add91d4-93c6-4357-96d8-a05b2a8ad333',
      trackingId: 'DVSXZBQ',
      registrationNumber: '2022DVSXZBQ',
      type: 'death',
      commentsOrNotes: '',
      regStatus: {
        type: 'REGISTERED',
        statusDate: '2022-02-01T10:33:51.600Z',
        officeName: 'Lusaka DNRPC District Office',
        officeAlias: 'Lusaka DNRPC District Office',
        officeAddressLevel3: 'Lusaka District',
        officeAddressLevel4: 'Lusaka Province'
      }
    },
    deceased: {
      iD: 123456781,
      socialSecurityNo: '123345',
      nationality: 'ZMB',
      firstNamesEng: 'First',
      familyNameEng: 'Last',
      birthDate: '2012-12-12',
      gender: 'male',
      maritalStatus: 'MARRIED',
      countryPermanent: 'ZMB',
      statePermanent: '0d6f7c82-d653-40c8-a003-bb14678ea64b',
      districtPermanent: '1664ae88-d1ef-4f02-b466-31aa6e7fac8b',
      ruralOrUrbanPermanent: 'RURAL',
      addressChiefPermanent: 'Chief',
      addressLine4CityOptionPermanent: '',
      addressLine3CityOptionPermanent: '',
      addressLine2CityOptionPermanent: '',
      numberOptionPermanent: '',
      addressLine1Permanent: 'Village',
      internationalStatePermanent: '0d6f7c82-d653-40c8-a003-bb14678ea64b',
      internationalDistrictPermanent: '1664ae88-d1ef-4f02-b466-31aa6e7fac8b',
      internationalCityPermanent: '',
      internationalAddressLine1Permanent: '',
      internationalAddressLine2Permanent: '',
      internationalAddressLine3Permanent: '',
      internationalPostcodePermanent: '',
      _fhirID: '3a344aa4-00cf-4882-ae3e-9a8f1dbaf2ca',
      seperator: '',
      occupation: '',
      permanentAddress: ''
    },
    deathEvent: {
      deathDate: '2021-12-12',
      manner: 'NATURAL_CAUSES',
      deathPlaceAddress: 'HEALTH_FACILITY',
      deathLocation: 'a1836374-00aa-477a-819f-7a40866674f7'
    },
    causeOfDeath: {
      causeOfDeathEstablished: true,
      causeOfDeathCode: 'age'
    },
    informant: {
      nationality: 'ZMB',
      applicantID: 123456780,
      firstNamesEng: 'First',
      familyNameEng: 'Last',
      relationship: 'SON',
      countryPermanent: 'ZMB',
      statePermanent: 'ec34cfe2-b566-4140-af22-71ff17d832d6',
      districtPermanent: '9cedaf28-8c0f-4d5f-b1c1-c96c437b0ba7',
      ruralOrUrbanPermanent: 'URBAN',
      addressChiefPermanent: '',
      addressLine4CityOptionPermanent: '',
      addressLine3CityOptionPermanent: '',
      addressLine2CityOptionPermanent: '',
      numberOptionPermanent: '',
      addressLine1Permanent: '',
      _fhirID: '9e9d8fec-74ce-465c-a1c7-a9f9d4c01e18',
      _fhirIDMap: {
        relatedPerson: '9e9d8fec-74ce-465c-a1c7-a9f9d4c01e18',
        individual: '0ce2264a-c3fe-416d-b585-b6f3fd5c36d8'
      },
      permanentAddress: '',
      internationalState: '',
      internationalDistrict: '',
      internationalCity: '',
      internationalAddressLine1: '',
      internationalAddressLine2: '',
      internationalAddressLine3: '',
      internationalPostcode: ''
    },
    father: {
      fatherFamilyNameEng: 'Last',
      _fhirID: '32dcfa2c-6313-4ebb-b03c-7fb243702e73'
    },
    mother: {
      motherFamilyNameEng: 'Last',
      _fhirID: '5491b237-10d6-4b22-bfc0-9ee9663bd4f2'
    },
    spouse: {
      hasDetails: {
        value: 'Yes',
        nestedFields: {
          spouseFirstNamesEng: 'spouse',
          spouseFamilyNameEng: 'name'
        }
      }
    },
    documents: {
      uploadDocForDeceased: [],
      uploadDocForApplicant: [],
      uploadDocForDeceasedDeath: []
    },
    _fhirIDMap: {
      composition: '85bccf72-6117-4cab-827d-47728becb0c1'
    },
    corrector: {
      relationship: {
        value: 'INFORMANT',
        nestedFields: {
          otherRelationship: ''
        }
      },
      hasShowedVerifiedDocument: false
    },
    review: {},
    supportingDocuments: {
      uploadDocForLegalProof: '',
      supportDocumentRequiredForCorrection: true
    },
    reason: {
      type: {
        value: 'MATERIAL_ERROR',
        nestedFields: {
          reasonForChange: ''
        }
      },
      additionalComment: ''
    }
  },
  originalData: {
    registration: {
      relationship: {
        value: 'SON',
        nestedFields: {
          otherRelationship: ''
        }
      },
      contactPoint: {
        value: 'APPLICANT',
        nestedFields: {
          registrationPhone: '0712345678',
          contactRelationship: ''
        }
      },
      _fhirID: '7add91d4-93c6-4357-96d8-a05b2a8ad333',
      trackingId: 'DVSXZBQ',
      registrationNumber: '2022DVSXZBQ',
      type: 'death',
      commentsOrNotes: '',
      regStatus: {
        type: 'REGISTERED',
        statusDate: '2022-02-01T10:33:51.600Z',
        officeName: 'Lusaka DNRPC District Office',
        officeAlias: 'Lusaka DNRPC District Office',
        officeAddressLevel3: 'Lusaka District',
        officeAddressLevel4: 'Lusaka Province'
      }
    },
    deceased: {
      iD: '123456789',
      socialSecurityNo: '123345',
      nationality: 'ZMB',
      firstNamesEng: 'First',
      familyNameEng: 'Last',
      birthDate: '2012-12-12',
      gender: 'male',
      maritalStatus: 'MARRIED',
      countryPermanent: 'ZMB',
      statePermanent: '0d6f7c82-d653-40c8-a003-bb14678ea64b',
      districtPermanent: '1664ae88-d1ef-4f02-b466-31aa6e7fac8b',
      ruralOrUrbanPermanent: 'URBAN',
      addressChiefPermanent: '',
      addressLine4CityOptionPermanent: '',
      addressLine3CityOptionPermanent: '',
      addressLine2CityOptionPermanent: '',
      numberOptionPermanent: '',
      addressLine1Permanent: '',
      internationalStatePermanent: '0d6f7c82-d653-40c8-a003-bb14678ea64b',
      internationalDistrictPermanent: '1664ae88-d1ef-4f02-b466-31aa6e7fac8b',
      internationalCityPermanent: '',
      internationalAddressLine1Permanent: '',
      internationalAddressLine2Permanent: '',
      internationalAddressLine3Permanent: '',
      internationalPostcodePermanent: '',
      _fhirID: '3a344aa4-00cf-4882-ae3e-9a8f1dbaf2ca'
    },
    deathEvent: {
      deathDate: '2021-12-12',
      manner: 'NATURAL_CAUSES',
      deathPlaceAddress: 'HEALTH_FACILITY',
      deathLocation: 'a1836374-00aa-477a-819f-7a40866674f7'
    },
    causeOfDeath: {
      causeOfDeathEstablished: true,
      causeOfDeathCode: 'age'
    },
    informant: {
      nationality: 'ZMB',
      applicantID: '123456789',
      firstNamesEng: 'First',
      familyNameEng: 'Last',
      relationship: 'SON',
      countryPermanent: 'ZMB',
      statePermanent: 'ec34cfe2-b566-4140-af22-71ff17d832d6',
      districtPermanent: '9cedaf28-8c0f-4d5f-b1c1-c96c437b0ba7',
      ruralOrUrbanPermanent: 'URBAN',
      addressChiefPermanent: '',
      addressLine4CityOptionPermanent: '',
      addressLine3CityOptionPermanent: '',
      addressLine2CityOptionPermanent: '',
      numberOptionPermanent: '',
      addressLine1Permanent: '',
      _fhirID: '9e9d8fec-74ce-465c-a1c7-a9f9d4c01e18',
      _fhirIDMap: {
        relatedPerson: '9e9d8fec-74ce-465c-a1c7-a9f9d4c01e18',
        individual: '0ce2264a-c3fe-416d-b585-b6f3fd5c36d8'
      }
    },
    father: {
      fatherFamilyNameEng: 'Last',
      _fhirID: '32dcfa2c-6313-4ebb-b03c-7fb243702e73'
    },
    mother: {
      motherFamilyNameEng: 'Last',
      _fhirID: '5491b237-10d6-4b22-bfc0-9ee9663bd4f2'
    },
    spouse: {
      hasDetails: {
        value: 'No',
        nestedFields: {}
      }
    },
    documents: {
      uploadDocForDeceased: [],
      uploadDocForApplicant: [],
      uploadDocForDeceasedDeath: []
    },
    _fhirIDMap: {
      composition: '85bccf72-6117-4cab-827d-47728becb0c1'
    }
  },
  review: true,
  event: Event.DEATH,
  registrationStatus: 'REGISTERED',
  downloadStatus: 'DOWNLOADED',
  modifiedOn: 1644490181166,
  visitedGroupIds: [
    {
      sectionId: 'informant',
      groupId: 'informant-view-group'
    },
    {
      sectionId: 'registration',
      groupId: 'point-of-contact'
    },
    {
      sectionId: 'deceased',
      groupId: 'deceased-view-group'
    },
    {
      sectionId: 'spouse',
      groupId: 'spouse-view-group'
    },
    {
      sectionId: 'deathEvent',
      groupId: 'deathEvent-deathLocation'
    }
  ],
  timeLoggedMS: 4446
}

const birthApplication: IApplication = {
  id: '31a78be1-5ab3-42c7-8f64-7678cb294508',
  data: {
    registration: {
      applicant: {
        nestedFields: {}
      },
      presentAtBirthRegistration: 'MOTHER',
      contactPoint: {
        value: 'MOTHER',
        nestedFields: {
          registrationPhone: '0712345678'
        }
      },
      _fhirID: 'd1bf168b-d2b9-4288-977c-ef368e1ec1d5',
      trackingId: 'BYMWBUG',
      registrationNumber: '2022BYMWBUG',
      commentsOrNotes: '',
      regStatus: {
        type: 'REGISTERED',
        statusDate: '2022-02-03T04:24:51.831Z',
        officeName: 'Lusaka DNRPC District Office',
        officeAlias: 'Lusaka DNRPC District Office',
        officeAddressLevel3: 'Lusaka District',
        officeAddressLevel4: 'Lusaka Province'
      }
    },
    child: {
      firstNamesEng: 'Alan',
      familyNameEng: 'Bush',
      gender: 'female',
      childBirthDate: '2010-10-10',
      multipleBirth: 1,
      placeOfBirth: 'HEALTH_FACILITY',
      birthLocation: '08ce1fa5-6e0b-4dd6-b9a4-8fb76777527a',
      _fhirID: 'f1378dfc-eb17-4ba3-aa8c-533133ce28ac'
    },
    mother: {
      nationality: 'ZMB',
      iD: '123456789',
      socialSecurityNo: '',
      firstNamesEng: 'first name',
      familyNameEng: 'last name',
      maritalStatus: 'MARRIED',
      countryPlaceOfHeritage: 'ZMB',
      statePlaceOfHeritage: '7b261ee2-9070-4b5d-85c4-0a30115c7ec7',
      districtPlaceOfHeritage: '8b52e805-27af-4bbc-8273-985f4c3ef65f',
      addressChiefPlaceOfHeritage: '',
      addressLine1PlaceOfHeritage: '',
      countryPermanent: 'ZMB',
      statePermanent: '53975eaf-b2e1-431d-9f85-9fd52e734760',
      districtPermanent: '361edbd5-432a-4429-88a2-7de81bc0e86c',
      ruralOrUrbanPermanent: 'URBAN',
      addressChiefPermanent: '',
      addressLine4CityOptionPermanent: '',
      addressLine3CityOptionPermanent: '',
      addressLine2CityOptionPermanent: '',
      numberOptionPermanent: '',
      addressLine1Permanent: '',
      currentAddressSameAsPermanent: true,
      country: 'ZMB',
      state: '53975eaf-b2e1-431d-9f85-9fd52e734760',
      district: '361edbd5-432a-4429-88a2-7de81bc0e86c',
      ruralOrUrban: 'URBAN',
      addressChief: '',
      addressLine4CityOption: '',
      addressLine3CityOption: '',
      addressLine2CityOption: '',
      numberOption: '',
      addressLine1: '',
      _fhirID: 'b610e43c-1db3-4b01-aae2-83dd2603c322',
      motherBirthDate: '',
      seperator: '',
      occupation: '',
      educationalAttainment: '',
      placeOfHeritage: '',
      internationalStatePlaceOfHeritage: '',
      internationalDistrictPlaceOfHeritage: '',
      internationalCityPlaceOfHeritage: '',
      internationalAddressLine1PlaceOfHeritage: '',
      internationalAddressLine2PlaceOfHeritage: '',
      internationalAddressLine3PlaceOfHeritage: '',
      internationalPostcodePlaceOfHeritage: '',
      permanentAddress: '',
      internationalStatePermanent: '',
      internationalDistrictPermanent: '',
      internationalCityPermanent: '',
      internationalAddressLine1Permanent: '',
      internationalAddressLine2Permanent: '',
      internationalAddressLine3Permanent: '',
      internationalPostcodePermanent: '',
      currentAddress: '',
      internationalState: '',
      internationalDistrict: '',
      internationalCity: '',
      internationalAddressLine1: '',
      internationalAddressLine2: '',
      internationalAddressLine3: '',
      internationalPostcode: ''
    },
    father: {
      fathersDetailsExist: true,
      permanentAddressSameAsMother: true,
      addressSameAsMother: true,
      iD: 123456789,
      socialSecurityNo: '',
      nationality: 'ZMB',
      firstNamesEng: 'Father',
      familyNameEng: 'Name',
      fatherBirthDate: '1930-12-12',
      seperator: '',
      maritalStatus: 'MARRIED',
      occupation: '',
      educationalAttainment: '',
      permanentAddress: '',
      countryPermanent: 'ZMB',
      statePermanent: '',
      districtPermanent: '',
      ruralOrUrbanPermanent: 'URBAN',
      addressChiefPermanent: '',
      addressLine4CityOptionPermanent: '',
      addressLine3CityOptionPermanent: '',
      addressLine2CityOptionPermanent: '',
      numberOptionPermanent: '',
      addressLine1Permanent: '',
      internationalStatePermanent: '',
      internationalDistrictPermanent: '',
      internationalCityPermanent: '',
      internationalAddressLine1Permanent: '',
      internationalAddressLine2Permanent: '',
      internationalAddressLine3Permanent: '',
      internationalPostcodePermanent: ''
    },
    documents: {
      uploadDocForChildDOB: [],
      uploadDocForMother: [],
      uploadDocForFather: [],
      uploadDocForApplicant: [],
      uploadDocForProofOfLegarGuardian: [],
      uploadDocForProofOfAssignedResponsibility: []
    },
    _fhirIDMap: {
      composition: '31a78be1-5ab3-42c7-8f64-7678cb294508',
      encounter: 'dbf6dc8e-c5bb-421f-a0b1-a6c5c61d1842',
      eventLocation: '08ce1fa5-6e0b-4dd6-b9a4-8fb76777527a',
      observation: {
        presentAtBirthRegistration: 'dd94ab22-00c9-42fa-8219-1c30ade60e81'
      }
    },
    corrector: {
      relationship: {
        value: 'MOTHER',
        nestedFields: {
          otherRelationship: ''
        }
      },
      hasShowedVerifiedDocument: false
    },
    review: {},
    supportingDocuments: {
      uploadDocForLegalProof: '',
      supportDocumentRequiredForCorrection: true
    },
    reason: {
      type: {
        value: 'CLERICAL_ERROR',
        nestedFields: {
          reasonForChange: ''
        }
      },
      additionalComment: 'Comment'
    }
  },
  originalData: {
    registration: {
      applicant: {
        nestedFields: {}
      },
      presentAtBirthRegistration: 'MOTHER',
      contactPoint: {
        value: 'MOTHER',
        nestedFields: {
          registrationPhone: '0712345678'
        }
      },
      _fhirID: 'd1bf168b-d2b9-4288-977c-ef368e1ec1d5',
      trackingId: 'BYMWBUG',
      registrationNumber: '2022BYMWBUG',
      commentsOrNotes: '',
      regStatus: {
        type: 'REGISTERED',
        statusDate: '2022-02-03T04:24:51.831Z',
        officeName: 'Lusaka DNRPC District Office',
        officeAlias: 'Lusaka DNRPC District Office',
        officeAddressLevel3: 'Lusaka District',
        officeAddressLevel4: 'Lusaka Province'
      }
    },
    child: {
      firstNamesEng: 'CF',
      familyNameEng: 'CL',
      gender: 'female',
      childBirthDate: '2010-10-10',
      multipleBirth: 1,
      placeOfBirth: 'HEALTH_FACILITY',
      birthLocation: '08ce1fa5-6e0b-4dd6-b9a4-8fb76777527a',
      _fhirID: 'f1378dfc-eb17-4ba3-aa8c-533133ce28ac'
    },
    mother: {
      nationality: 'ZMB',
      iD: '123456789',
      socialSecurityNo: '',
      firstNamesEng: 'Mother',
      familyNameEng: 'Name',
      maritalStatus: 'MARRIED',
      countryPlaceOfHeritage: 'ZMB',
      statePlaceOfHeritage: '7b261ee2-9070-4b5d-85c4-0a30115c7ec7',
      districtPlaceOfHeritage: '8b52e805-27af-4bbc-8273-985f4c3ef65f',
      addressChiefPlaceOfHeritage: '',
      addressLine1PlaceOfHeritage: '',
      countryPermanent: 'ZMB',
      statePermanent: '53975eaf-b2e1-431d-9f85-9fd52e734760',
      districtPermanent: '361edbd5-432a-4429-88a2-7de81bc0e86c',
      ruralOrUrbanPermanent: 'URBAN',
      addressChiefPermanent: '',
      addressLine4CityOptionPermanent: '',
      addressLine3CityOptionPermanent: '',
      addressLine2CityOptionPermanent: '',
      numberOptionPermanent: '',
      addressLine1Permanent: '',
      currentAddressSameAsPermanent: true,
      country: 'ZMB',
      state: '53975eaf-b2e1-431d-9f85-9fd52e734760',
      district: '361edbd5-432a-4429-88a2-7de81bc0e86c',
      ruralOrUrban: 'URBAN',
      addressChief: '',
      addressLine4CityOption: '',
      addressLine3CityOption: '',
      addressLine2CityOption: '',
      numberOption: '',
      addressLine1: '',
      _fhirID: 'b610e43c-1db3-4b01-aae2-83dd2603c322'
    },
    father: {
      fathersDetailsExist: false,
      permanentAddressSameAsMother: true,
      addressSameAsMother: true
    },
    documents: {
      uploadDocForChildDOB: [],
      uploadDocForMother: [],
      uploadDocForFather: [],
      uploadDocForApplicant: [],
      uploadDocForProofOfLegarGuardian: [],
      uploadDocForProofOfAssignedResponsibility: []
    },
    _fhirIDMap: {
      composition: '31a78be1-5ab3-42c7-8f64-7678cb294508',
      encounter: 'dbf6dc8e-c5bb-421f-a0b1-a6c5c61d1842',
      eventLocation: '08ce1fa5-6e0b-4dd6-b9a4-8fb76777527a',
      observation: {
        presentAtBirthRegistration: 'dd94ab22-00c9-42fa-8219-1c30ade60e81'
      }
    }
  },
  review: true,
  event: Event.BIRTH,
  registrationStatus: 'REGISTERED',
  downloadStatus: 'DOWNLOADED',
  modifiedOn: 1644407705186,
  visitedGroupIds: [
    {
      sectionId: 'mother',
      groupId: 'mother-view-group'
    },
    {
      sectionId: 'father',
      groupId: 'father-view-group'
    }
  ],
  timeLoggedMS: 990618
}

const { store, history } = createStore()

describe('Correction summary', () => {
  describe('for an application', () => {
    beforeEach(async () => {
      store.dispatch(storeApplication(birthApplication))
      wrapper = await createTestComponent(
        <CorrectionForm
          {...createRouterProps(
            formatUrl(CERTIFICATE_CORRECTION, {
              applicationId: birthApplication.id,
              pageId: CorrectionSection.Summary
            }),
            { isNavigatedInsideApp: false },
            {
              matchParams: {
                applicationId: birthApplication.id,
                pageId: CorrectionSection.Summary
              }
            }
          )}
        />,
        {
          store,
          history
        }
      )
    })
    it('should disable the mark correction button if fees no is selected', () => {
      expect(
        wrapper.find('#make_correction').hostNodes().props().disabled
      ).toBeTruthy()
    })

    it('should match corrector with Child name', () => {
      ;(birthApplication.data.corrector.relationship as any).value = 'CHILD'
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const msg = instance.getRequestedBy()
      expect(msg).toEqual('Alan Bush')
    })

    it('should match corrector with Father name', () => {
      ;(birthApplication.data.corrector.relationship as any).value = 'FATHER'
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const msg = instance.getRequestedBy()
      expect(msg).toEqual('Father Name')
    })

    it('should match corrector with LEGAL_GUARDIAN', () => {
      ;(birthApplication.data.corrector.relationship as any).value =
        'LEGAL_GUARDIAN'
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const corrector = instance.getRequestedBy()
      expect(corrector).toEqual('Legal guardian')
    })

    it('should match corrector with ANOTHER_AGENT', () => {
      ;(birthApplication.data.corrector.relationship as any).value =
        'ANOTHER_AGENT'
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const corrector = instance.getRequestedBy()
      expect(corrector).toEqual('Another registration agent or field agent')
    })

    it('should match corrector with ANOTHER_AGENT', () => {
      ;(birthApplication.data.corrector.relationship as any).value = 'REGISTRAR'
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const corrector = instance.getRequestedBy()
      expect(corrector).toEqual('Me (Registrar)')
    })

    it('should match corrector with COURT', () => {
      ;(birthApplication.data.corrector.relationship as any).value = 'COURT'
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const corrector = instance.getRequestedBy()
      expect(corrector).toEqual('Court')
    })

    it('should match corrector with OTHER', () => {
      birthApplication.data.corrector.relationship = {
        value: 'OTHER',
        nestedFields: {
          otherRelationship: 'Uncle'
        }
      }
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const corrector = instance.getRequestedBy()
      expect(corrector).toEqual('Uncle')
    })

    it('should match corrector with CLERICAL_ERROR', () => {
      ;(birthApplication.data.reason as any).type.value = 'CLERICAL_ERROR'
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const reason = instance.getReasonForRequest()
      expect(reason).toBeDefined()
    })

    it('should match corrector with MATERIAL_ERROR', () => {
      ;(birthApplication.data.reason as any).type.value = 'MATERIAL_ERROR'
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const reason = instance.getReasonForRequest()
      expect(reason).toBeDefined()
    })

    it('should match corrector with MATERIAL_OMISSION', () => {
      ;(birthApplication.data.reason as any).type.value = 'MATERIAL_OMISSION'
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const reason = instance.getReasonForRequest()
      expect(reason).toBeDefined()
    })

    it('should match corrector with JUDICIAL_ORDER', () => {
      ;(birthApplication.data.reason as any).type.value = 'JUDICIAL_ORDER'
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const reason = instance.getReasonForRequest()
      expect(reason).toBeDefined()
    })

    it('should match correction reason with OTHER', () => {
      birthApplication.data.reason = {
        type: {
          value: 'OTHER',
          nestedFields: {
            reasonForChange: 'Other reason'
          }
        },
        additionalComment: ''
      }
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const reason = instance.getReasonForRequest()
      expect(reason).toBeDefined()
    })

    it('should not disable the mark correction if fees No is selected', () => {
      wrapper
        .find('#correctionFees_NOT_REQUIRED')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()
      expect(
        wrapper.find('#make_correction').hostNodes().props().disabled
      ).toBeFalsy()
    })

    it('should disable the mark correction if fees yes option is selected without specifying the fees amount and document', () => {
      wrapper
        .find('#correctionFees_REQUIRED')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()
      expect(
        wrapper.find('#make_correction').hostNodes().props().disabled
      ).toBeTruthy()
    })

    it('should go to review section when back to review is pressed', async () => {
      wrapper.find('#back_to_review').hostNodes().simulate('click')
      await flushPromises()
      wrapper.update()

      expect(history.location.pathname).toContain('/review-view-group')
    })

    it('should cancel the correction when the cross button is pressed', () => {
      wrapper.find('#crcl-btn').hostNodes().simulate('click')

      wrapper.update()

      expect(history.location.pathname).toContain('/review')
    })

    it('should death application', () => {
      store.dispatch(storeApplication(deathApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      expect(instance).toBeDefined()
    })
  })
})
