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
import {
  createTestApp,
  mockOfflineData,
  validToken,
  getItem,
  flushPromises,
  setItem
} from '@client/tests/util'
import { DRAFT_BIRTH_PARENT_FORM } from '@client/navigation/routes'
import {
  storeDeclaration,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { v4 as uuid } from 'uuid'
import {
  draftToGqlTransformer,
  gqlToDraftTransformer
} from '@client/transformer'
import { getRegisterForm } from '@opencrvs/client/src/forms/register/declaration-selectors'
import { getOfflineDataSuccess } from '@client/offline/actions'
import { Event, IForm } from '@opencrvs/client/src/forms'
import { clone } from 'lodash'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

interface IPersonDetails {
  [key: string]: any
}

describe('when draft data is transformed to graphql', () => {
  let app: ReactWrapper
  let history: History
  let store: Store
  let customDraft: IDeclaration
  let form: IForm

  const childDetails: IPersonDetails = {
    attendantAtBirth: 'NURSE',
    childBirthDate: '1999-10-10',
    familyName: 'ইসলাম',
    familyNameEng: 'Islam',
    firstNames: 'নাইম',
    firstNamesEng: 'Naim',
    gender: 'male',
    placeOfBirth: 'HOSPITAL',
    birthLocation: '90d39759-7f02-4646-aca3-9272b4b5ce5a',
    multipleBirth: '2',
    birthType: 'SINGLE',
    weightAtBirth: '5'
  }

  const fatherDetails: IPersonDetails = {
    fathersDetailsExist: true,
    iD: '23423442342423424',
    iDType: 'OTHER',
    iDTypeOther: 'Taxpayer Identification Number',
    addressSameAsMother: true,
    permanentAddressSameAsMother: true,
    country: 'BGD',
    countryPermanent: 'BGD',
    currentAddress: '',
    motherBirthDate: '1999-10-10',
    dateOfMarriage: '2010-10-10',
    educationalAttainment: 'PRIMARY_ISCED_1',
    familyName: 'ইসলাম',
    familyNameEng: 'Islam',
    firstNames: 'আনোয়ার',
    firstNamesEng: 'Anwar',
    maritalStatus: 'MARRIED',
    nationality: 'BGD'
  }

  const motherDetails: IPersonDetails = {
    iD: '2342434534565',
    iDType: 'NATIONAL_ID',
    country: 'BGD',
    nationality: 'BGD',
    familyName: 'ইসলাম',
    familyNameEng: 'Islam',
    firstNames: 'রোকেয়া',
    firstNamesEng: 'Rokeya',
    maritalStatus: 'MARRIED',
    dateOfMarriage: '2010-10-10',
    fatherBirthDate: '1999-10-10',
    educationalAttainment: 'PRIMARY_ISCED_1',
    currentAddressSameAsPermanent: true,
    addressLine1: 'Rd #10',
    addressLine1Permanent: 'Rd#10',
    addressLine2: 'Akua',
    addressLine2Permanent: 'Akua',
    addressLine3: 'union1',
    addressLine3Permanent: 'union1',
    addressLine4: 'upazila10',
    addressLine4Permanent: 'upazila10',
    countryPermanent: 'BGD',
    currentAddress: '',
    district: 'district2',
    districtPermanent: 'district2',
    permanentAddress: '',
    postCode: '1020',
    postCodePermanent: '1010',
    state: 'state4',
    statePermanent: 'state4'
  }

  const registrationDetails = {
    commentsOrNotes: 'comments',
    presentAtBirthRegistration: 'MOTHER_ONLY',
    registrationCertificateLanguage: ['en'],
    registrationPhone: '01736478884',
    whoseContactDetails: 'MOTHER',
    applicant: {
      value: 'MOTHER',
      nestedFields: {
        otherRelationShip: ''
      }
    },
    contactPoint: {
      value: 'OTHER',
      nestedFields: {
        contactRelationshipOther: 'grandma',
        registrationPhone: '01736478884'
      }
    }
  }

  const primaryCaregiver = {
    parentDetailsType: 'MOTHER_ONLY',
    reasonMotherNotApplying: '',
    motherIsDeceased: [],
    reasonFatherNotApplying: '',
    fatherIsDeceased: [],
    primaryCaregiverType: {
      value: 'INFORMANT',
      nestedFields: { name: '', phone: '', reasonNotApplying: '' }
    }
  }

  beforeEach(async () => {
    getItem.mockReturnValue(validToken)
    setItem.mockClear()
    fetch.resetMocks()
    fetch.mockResponses(
      [JSON.stringify({ data: mockOfflineData.locations }), { status: 200 }],
      [JSON.stringify({ data: mockOfflineData.facilities }), { status: 200 }]
    )
    const testApp = await createTestApp()
    app = testApp.app
    await flushPromises()
    app.update()
    history = testApp.history
    store = testApp.store
    store.dispatch(getOfflineDataSuccess(JSON.stringify(mockOfflineData)))

    const data = {
      child: childDetails,
      father: fatherDetails,
      mother: motherDetails,
      registration: registrationDetails,
      primaryCaregiver,
      documents: { imageUploader: '' }
    }

    customDraft = {
      id: uuid(),
      data,
      event: Event.BIRTH,
      submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    }
    store.dispatch(storeDeclaration(customDraft))
    form = getRegisterForm(store.getState())[Event.BIRTH]
    history.replace(
      DRAFT_BIRTH_PARENT_FORM.replace(
        ':declarationId',
        customDraft.id.toString()
      )
    )

    app.update()
  })

  describe('when user is in birth registration by parent informant view', () => {
    it('Check if new place of birth location address is parsed properly', () => {
      const clonedChild = clone(childDetails)
      clonedChild.placeOfBirth = 'PRIVATE_HOME'
      clonedChild.addressLine1 = 'Rd #10'
      clonedChild.addressLine2 = 'Akua'
      clonedChild.addressLine3 = 'union1'
      clonedChild.addressLine4 = 'upazila10'
      clonedChild.country = 'BGD'
      clonedChild.district = 'district2'
      clonedChild.postCode = '1020'
      clonedChild.state = 'state4'
      const data = {
        child: clonedChild,
        father: fatherDetails,
        mother: motherDetails,
        registration: registrationDetails,
        primaryCaregiver,
        documents: { imageUploader: '' }
      }

      expect(
        draftToGqlTransformer(
          form,
          data,
          '9633042c-ca34-4b9f-959b-9d16909fd85c'
        ).eventLocation.type
      ).toBe('PRIVATE_HOME')
    })
    it('Check if contactNumber is found properly', () => {
      const registration = clone(registrationDetails)

      const data = {
        child: childDetails,
        father: fatherDetails,
        mother: motherDetails,
        registration,
        primaryCaregiver,
        documents: { imageUploader: '' }
      }
      expect(
        draftToGqlTransformer(form, data).registration.contactPhoneNumber
      ).toBe('+8801736478884')
    })
    it('Pass false as fathersDetailsExist on father section', () => {
      const clonedFather = clone(fatherDetails)
      clonedFather.fathersDetailsExist = false

      const data = {
        child: childDetails,
        father: clonedFather,
        mother: motherDetails,
        registration: registrationDetails,
        primaryCaregiver,
        documents: { imageUploader: '' }
      }

      expect(draftToGqlTransformer(form, data).father).toBeUndefined()
      expect(
        draftToGqlTransformer(form, data).registration.inCompleteFields
      ).toBeUndefined()
    })
    it('Sends inCompleteFields if in-complete data is given', () => {
      const data = {
        child: {},
        father: {},
        mother: {},
        registration: {
          presentAtBirthRegistration: 'MOTHER_ONLY',
          registrationPhone: '01736478884',
          whoseContactDetails: 'MOTHER'
        },
        primaryCaregiver,
        documents: {}
      }
      expect(
        draftToGqlTransformer(form, data).registration.inCompleteFields
      ).toContain('child/child-view-group/placeOfBirth')
    })
    it('Sends inCompleteFields when registration data is also missing', () => {
      const data = {
        child: {},
        father: {},
        mother: {},
        documents: {},
        registration: {},
        primaryCaregiver: {}
      }
      expect(
        draftToGqlTransformer(form, data).registration.inCompleteFields
      ).toBeDefined()
    })

    it('transform primary caregiver data to gql data', () => {
      const data = {
        child: {},
        father: {},
        mother: {},
        registration: {
          presentAtBirthRegistration: 'OTHER',
          registrationPhone: '01736478884',
          whoseContactDetails: 'MOTHER'
        },
        primaryCaregiver: {
          parentDetailsType: 'MOTHER_AND_FATHER',
          primaryCaregiverType: {
            value: 'LEGAL_GUARDIAN',
            nestedFields: {
              name: 'Alex',
              phone: '01686942106',
              reasonNotApplying: 'sick'
            }
          },
          reasonFatherNotApplying: '',
          reasonMotherNotApplying: 'sick',
          fatherIsDeceased: ['deceased']
        },
        documents: {}
      }
      const transformedData = {
        parentDetailsType: 'MOTHER_AND_FATHER',
        primaryCaregiver: {
          name: [
            {
              use: 'en',
              familyName: 'Alex'
            }
          ],
          telecom: [
            {
              system: 'phone',
              value: '01686942106'
            }
          ]
        },
        reasonsNotApplying: [
          {
            primaryCaregiverType: 'MOTHER',
            reasonNotApplying: 'sick'
          },
          {
            primaryCaregiverType: 'FATHER',
            isDeceased: true
          },
          {
            primaryCaregiverType: 'LEGAL_GUARDIAN',
            reasonNotApplying: 'sick'
          }
        ]
      }

      expect(draftToGqlTransformer(form, data).primaryCaregiver).toEqual(
        transformedData
      )
    })

    it('transform gql data to primary caregiver form data', () => {
      const data = {
        id: '70773af0-68e3-4b08-aace-e28f4809d9c1',
        child: null,
        informant: {
          individual: null,
          relationship: null,
          otherRelationship: null
        },
        primaryCaregiver: {
          parentDetailsType: 'MOTHER_AND_FATHER',
          primaryCaregiver: {
            name: [
              {
                use: 'en',
                firstNames: '',
                familyName: 'Alex'
              }
            ],
            telecom: [
              {
                system: 'phone',
                value: '01686942106',
                use: null
              }
            ]
          },
          reasonsNotApplying: [
            {
              primaryCaregiverType: 'MOTHER',
              reasonNotApplying: '',
              isDeceased: true
            },
            {
              primaryCaregiverType: 'FATHER',
              reasonNotApplying: 'sick',
              isDeceased: false
            },
            {
              primaryCaregiverType: 'OTHER',
              reasonNotApplying: 'sick',
              isDeceased: null
            }
          ]
        },
        mother: null,
        father: null,
        registration: {
          contact: 'MOTHER',
          contactRelationship: null,
          contactPhoneNumber: '01555555555',
          attachments: null,
          status: [
            {
              comments: null,
              type: 'DECLARED'
            }
          ],
          type: 'BIRTH',
          trackingId: 'BWH1TVW',
          registrationNumber: null
        },
        attendantAtBirth: null,
        weightAtBirth: null,
        birthType: null,
        eventLocation: null,
        presentAtBirthRegistration: 'OTHER'
      }

      const primaryCaregiverData = {
        parentDetailsType: 'MOTHER_AND_FATHER',
        motherIsDeceased: ['deceased'],
        reasonFatherNotApplying: 'sick',
        primaryCaregiverType: {
          value: 'OTHER',
          nestedFields: {
            name: 'Alex',
            phone: '01686942106',
            reasonNotApplying: 'sick'
          }
        }
      }

      expect(gqlToDraftTransformer(form, data).primaryCaregiver).toEqual(
        primaryCaregiverData
      )
    })

    it('transform gql data to primary caregiver form data', () => {
      const data = {
        id: '70773af0-68e3-4b08-aace-e28f4809d9c1',
        child: null,
        informant: {
          individual: null,
          relationship: null,
          otherRelationship: null
        },
        primaryCaregiver: {
          parentDetailsType: 'MOTHER_AND_FATHER',
          primaryCaregiver: {
            name: [
              {
                use: 'en',
                firstNames: '',
                familyName: 'Alex'
              }
            ],
            telecom: [
              {
                system: 'phone',
                value: '01686942106',
                use: null
              }
            ]
          },
          reasonsNotApplying: [
            {
              primaryCaregiverType: 'MOTHER',
              reasonNotApplying: '',
              isDeceased: true
            },
            {
              primaryCaregiverType: 'OTHER',
              reasonNotApplying: 'sick',
              isDeceased: null
            }
          ]
        },
        mother: null,
        father: null,
        registration: {
          contact: 'MOTHER',
          contactRelationship: null,
          contactPhoneNumber: '01555555555',
          attachments: null,
          status: [
            {
              comments: null,
              type: 'DECLARED'
            }
          ],
          type: 'BIRTH',
          trackingId: 'BWH1TVW',
          registrationNumber: null
        },
        attendantAtBirth: null,
        weightAtBirth: null,
        birthType: null,
        eventLocation: null,
        presentAtBirthRegistration: 'OTHER'
      }

      const primaryCaregiverData = {
        motherIsDeceased: ['deceased'],
        parentDetailsType: 'MOTHER_AND_FATHER',
        primaryCaregiverType: {
          value: 'OTHER',
          nestedFields: {
            name: 'Alex',
            phone: '01686942106',
            reasonNotApplying: 'sick'
          }
        }
      }

      expect(gqlToDraftTransformer(form, data).primaryCaregiver).toEqual(
        primaryCaregiverData
      )
    })

    it('transform gql data from form correction data', () => {
      const data = {
        child: childDetails,
        father: fatherDetails,
        mother: motherDetails,
        registration: {
          ...registrationDetails,
          applicant: {
            value: 'FATHER',
            nestedFields: {
              otherRelationShip: ''
            }
          },
          contactPoint: {
            value: 'OTHER',
            nestedFields: {
              contactRelationshipOther: 'grandma',
              registrationPhone: '01736478896'
            }
          }
        },
        primaryCaregiver,
        documents: { imageUploader: '' }
      }

      const originalData = {
        child: {
          ...childDetails,
          familyNameEng: 'Khan'
        },
        father: fatherDetails,
        mother: motherDetails,
        registration: registrationDetails,
        primaryCaregiver,
        documents: { imageUploader: '' }
      }

      const transformedCorrectionData = {
        values: [
          {
            fieldName: 'applicant',
            newValue: 'FATHER',
            oldValue: 'MOTHER',
            section: 'registration'
          },
          {
            fieldName: 'contactPoint.nestedFields.registrationPhone',
            newValue: '01736478896',
            oldValue: '01736478884',
            section: 'registration'
          },
          {
            section: 'child',
            fieldName: 'familyNameEng',
            oldValue: 'Khan',
            newValue: 'Islam'
          }
        ]
      }

      expect(
        draftToGqlTransformer(
          form,
          data,
          '9633042c-ca34-4b9f-959b-9d16909fd85c',
          originalData
        ).registration.correction
      ).toEqual(transformedCorrectionData)
    })
  })
})
