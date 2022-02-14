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
  flushPromises,
  mockDeathApplicationData
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
    ...mockDeathApplicationData,
    informant: {
      firstNamesEng: 'John',
      familyNameEng: 'Millar'
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
  originalData: mockDeathApplicationData,
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
    ...mockApplicationData,
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
  originalData: mockApplicationData,
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
  describe('for a birth application', () => {
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
      expect(msg).toEqual('Mike Test')
    })

    it('should match corrector with Father name', () => {
      ;(birthApplication.data.corrector.relationship as any).value = 'FATHER'
      store.dispatch(storeApplication(birthApplication))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const msg = instance.getRequestedBy()
      expect(msg).toEqual('Jeff Test')
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
  })
  describe('for a death application', () => {
    beforeEach(async () => {
      // ;(deathApplication.data.corrector.relationship as any).value = 'INFORMANT'

      store.dispatch(storeApplication(deathApplication))
      wrapper = await createTestComponent(
        <CorrectionForm
          {...createRouterProps(
            formatUrl(CERTIFICATE_CORRECTION, {
              applicationId: deathApplication.id,
              pageId: CorrectionSection.Summary
            }),
            { isNavigatedInsideApp: false },
            {
              matchParams: {
                applicationId: deathApplication.id,
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
    it('should return corrector informat', () => {
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const corrector = instance.getRequestedBy()
      expect(corrector).toEqual('John Millar')
    })
  })
})
