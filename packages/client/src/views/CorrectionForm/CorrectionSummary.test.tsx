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
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockDeclarationData,
  createRouterProps,
  flushPromises,
  mockDeathDeclarationData,
  getRegisterFormFromStore,
  mockOfflineData,
  userDetails
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { CorrectionSection } from '@client/forms'
import { Event } from '@client/utils/gateway'
import {
  IDeclaration,
  storeDeclaration,
  DOWNLOAD_STATUS
} from '@client/declarations'
import { CorrectionForm } from './CorrectionForm'
import { formatUrl } from '@client/navigation'
import { CERTIFICATE_CORRECTION } from '@client/navigation/routes'
import { REQUEST_REG_CORRECTION } from '@client/forms/correction/mutations'
import { draftToGqlTransformer } from '@client/transformer'
import { getOfflineDataSuccess } from '@client/offline/actions'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'

let wrapper: ReactWrapper<{}, {}>

const deathDeclaration: IDeclaration = {
  id: '85bccf72-6117-4cab-827d-47728becb0c1',
  data: {
    ...mockDeathDeclarationData,
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
      uploadDocForInformant: [],
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
  originalData: mockDeathDeclarationData,
  review: true,
  event: Event.Death,
  registrationStatus: 'REGISTERED',
  downloadStatus: DOWNLOAD_STATUS.DOWNLOADED,
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

const birthDeclaration: IDeclaration = {
  id: '31a78be1-5ab3-42c7-8f64-7678cb294508',
  data: {
    ...mockDeclarationData,
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
  originalData: mockDeclarationData,
  review: true,
  event: Event.Birth,
  registrationStatus: 'REGISTERED',
  downloadStatus: DOWNLOAD_STATUS.DOWNLOADED,
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
  describe('for a birth declaration', () => {
    beforeEach(async () => {
      store.dispatch(storeDeclaration(birthDeclaration))
      store.dispatch(getOfflineDataSuccess(JSON.stringify(mockOfflineData)))
      const form = await getRegisterFormFromStore(store, Event.Birth)
      wrapper = await createTestComponent(
        <CorrectionForm
          {...createRouterProps(
            formatUrl(CERTIFICATE_CORRECTION, {
              declarationId: birthDeclaration.id,
              pageId: CorrectionSection.Summary
            }),
            { isNavigatedInsideApp: false },
            {
              matchParams: {
                declarationId: birthDeclaration.id,
                pageId: CorrectionSection.Summary
              }
            }
          )}
        />,
        {
          store,
          history,
          graphqlMocks: [
            {
              request: {
                query: REQUEST_REG_CORRECTION,
                variables: draftToGqlTransformer(
                  form,
                  birthDeclaration.data,
                  birthDeclaration.id,
                  userDetails
                )
              },
              result: {
                data: {
                  requsetBirthRegistrationCorrection: '201908122365BDSS0SE1'
                }
              }
            }
          ]
        }
      )
    })
    it('should disable the mark correction button if fees no is selected', () => {
      expect(
        wrapper.find('#make_correction').hostNodes().props().disabled
      ).toBeTruthy()
    })

    it('should match corrector with Child name', () => {
      ;(birthDeclaration.data.corrector.relationship as any).value = 'CHILD'
      store.dispatch(storeDeclaration(birthDeclaration))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const msg = instance.getRequestedBy()
      expect(msg).toEqual('Mike Test')
    })

    it('should match corrector with Father name', () => {
      ;(birthDeclaration.data.corrector.relationship as any).value = 'FATHER'
      store.dispatch(storeDeclaration(birthDeclaration))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const msg = instance.getRequestedBy()
      expect(msg).toEqual('Jeff Test')
    })

    it('should match corrector with LEGAL_GUARDIAN', () => {
      ;(birthDeclaration.data.corrector.relationship as any).value =
        'LEGAL_GUARDIAN'
      store.dispatch(storeDeclaration(birthDeclaration))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const corrector = instance.getRequestedBy()
      expect(corrector).toEqual('Legal guardian')
    })

    it('should match corrector with ANOTHER_AGENT', () => {
      ;(birthDeclaration.data.corrector.relationship as any).value =
        'ANOTHER_AGENT'
      store.dispatch(storeDeclaration(birthDeclaration))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const corrector = instance.getRequestedBy()
      expect(corrector).toEqual('Another registration agent or field agent')
    })

    it('should match corrector with ANOTHER_AGENT', () => {
      ;(birthDeclaration.data.corrector.relationship as any).value = 'REGISTRAR'
      store.dispatch(storeDeclaration(birthDeclaration))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const corrector = instance.getRequestedBy()
      expect(corrector).toEqual('Me (Registrar)')
    })

    it('should match corrector with COURT', () => {
      ;(birthDeclaration.data.corrector.relationship as any).value = 'COURT'
      store.dispatch(storeDeclaration(birthDeclaration))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const corrector = instance.getRequestedBy()
      expect(corrector).toEqual('Court')
    })

    it('should match corrector with OTHER', () => {
      birthDeclaration.data.corrector.relationship = {
        value: 'OTHER',
        nestedFields: {
          otherRelationship: 'Uncle'
        }
      }
      store.dispatch(storeDeclaration(birthDeclaration))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const corrector = instance.getRequestedBy()
      expect(corrector).toEqual('Uncle')
    })

    it('should match corrector with CLERICAL_ERROR', () => {
      ;(birthDeclaration.data.reason as any).type.value = 'CLERICAL_ERROR'
      store.dispatch(storeDeclaration(birthDeclaration))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const reason = instance.getReasonForRequest()
      expect(reason).toBeDefined()
    })

    it('should match corrector with MATERIAL_ERROR', () => {
      ;(birthDeclaration.data.reason as any).type.value = 'MATERIAL_ERROR'
      store.dispatch(storeDeclaration(birthDeclaration))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const reason = instance.getReasonForRequest()
      expect(reason).toBeDefined()
    })

    it('should match corrector with MATERIAL_OMISSION', () => {
      ;(birthDeclaration.data.reason as any).type.value = 'MATERIAL_OMISSION'
      store.dispatch(storeDeclaration(birthDeclaration))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const reason = instance.getReasonForRequest()
      expect(reason).toBeDefined()
    })

    it('should match corrector with JUDICIAL_ORDER', () => {
      ;(birthDeclaration.data.reason as any).type.value = 'JUDICIAL_ORDER'
      store.dispatch(storeDeclaration(birthDeclaration))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const reason = instance.getReasonForRequest()
      expect(reason).toBeDefined()
    })

    it('should match correction reason with OTHER', () => {
      birthDeclaration.data.reason = {
        type: {
          value: 'OTHER',
          nestedFields: {
            reasonForChange: 'Other reason'
          }
        },
        additionalComment: ''
      }
      store.dispatch(storeDeclaration(birthDeclaration))
      const instance = wrapper
        .find('CorrectionSummaryComponent')
        .instance() as any
      const reason = instance.getReasonForRequest()
      expect(reason).toBeDefined()
    })

    it('should disable the mark correction if fees yes option is selected without specifying the fees amount and document', () => {
      wrapper.find('#correctionFees_REQUIRED').hostNodes().simulate('click')
      wrapper.update()
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

    it('should go to review section when back to review is pressed', async () => {
      wrapper.find('#back_to_review').hostNodes().simulate('click')
      await flushPromises()
      wrapper.update()

      expect(history.location.pathname).toContain('/review-view-group')
    })

    it('should cancel the correction when the cross button is pressed', () => {
      wrapper.find('#crcl-btn').hostNodes().simulate('click')

      wrapper.update()

      expect(history.location.pathname).toContain(WORKQUEUE_TABS.readyForReview)
    })

    it('after successful correction request redirects to  reg home review tab', () => {
      wrapper
        .find('#correctionFees_NOT_REQUIRED')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()
      wrapper.find('#make_correction').hostNodes().simulate('click')
      wrapper.update()
      expect(history.location.pathname).toContain(
        `registration-home/${WORKQUEUE_TABS.readyForReview}`
      )
    })
  })
  describe('for a death declaration', () => {
    beforeEach(async () => {
      // ;(deathDeclaration.data.corrector.relationship as any).value = 'INFORMANT'

      store.dispatch(storeDeclaration(deathDeclaration))
      wrapper = await createTestComponent(
        <CorrectionForm
          {...createRouterProps(
            formatUrl(CERTIFICATE_CORRECTION, {
              declarationId: deathDeclaration.id,
              pageId: CorrectionSection.Summary
            }),
            { isNavigatedInsideApp: false },
            {
              matchParams: {
                declarationId: deathDeclaration.id,
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
