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
      firstNamesEng: '',
      familyNameEng: 'F Last',
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
      additionalComment: ''
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
      firstNamesEng: 'MF',
      familyNameEng: 'ML',
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

    it('should not disable the mark correction if Fees amount and document are selected', async () => {
      wrapper
        .find('#correctionFees_REQUIRED')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()

      wrapper
        .find('input[name="correctionFees.nestedFields.totalFees"]')
        .simulate('change', {
          target: {
            name: 'correctionFees.nestedFields.totalFees',
            value: '10'
          }
        })

      wrapper
        .find('#image_file_uploader_field')
        .hostNodes()
        .simulate('change', {
          target: {
            files: [
              getFileFromBase64String(
                validImageB64String,
                'index.png',
                'image/png'
              )
            ]
          }
        })
      // await flushPromises()
      wrapper.update()

      expect(
        wrapper.find('#make_correction').hostNodes().props().disabled
      ).toBeFalsy()
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
  })
})
