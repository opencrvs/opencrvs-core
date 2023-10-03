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
import { Event } from '@client/utils/gateway'
import {
  getDraftInformantFullName,
  transformSearchQueryDataToDraft
} from '@client/utils/draftUtils'
import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet
} from '@opencrvs/gateway/src/graphql/schema'

describe('draftUtils tests', () => {
  describe('getDraftInformantFullName()', () => {
    describe('Birth event', () => {
      it('Returns child english name properly', () => {
        expect(
          getDraftInformantFullName({
            id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
            data: {
              child: {
                firstNames: 'মুশ্রাফুল',
                familyName: 'হক',
                firstNamesEng: 'Mushraful',
                familyNameEng: 'Hoque'
              }
            },
            event: Event.Birth,
            savedOn: 1558037863335,
            modifiedOn: 1558037867987
          })
        ).toBe('Mushraful Hoque')
      })
      it('Returns child bangla name properly', () => {
        expect(
          getDraftInformantFullName(
            {
              id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
              data: {
                child: {
                  familyName: 'হক',
                  firstNamesEng: 'Mushraful',
                  familyNameEng: 'Hoque'
                }
              },
              event: Event.Birth,
              savedOn: 1558037863335,
              modifiedOn: 1558037867987
            },
            'bn'
          )
        ).toBe('হক')
      })
    })
    describe('Death event', () => {
      it('Returns deceased english name properly', () => {
        expect(
          getDraftInformantFullName({
            id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
            data: {
              deceased: {
                firstNames: 'মুশ্রাফুল',
                familyName: 'হক',
                familyNameEng: 'Hoque'
              }
            },
            event: Event.Death,
            savedOn: 1558037863335,
            modifiedOn: 1558037867987
          })
        ).toBe('Hoque')
      })
      it('Returns child bangla name properly', () => {
        expect(
          getDraftInformantFullName(
            {
              id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
              data: {
                deceased: {
                  firstNames: 'মুশ্রাফুল',
                  familyName: 'হক',
                  firstNamesEng: 'Mushraful',
                  familyNameEng: 'Hoque'
                }
              },
              event: Event.Death,
              savedOn: 1558037863335,
              modifiedOn: 1558037867987
            },
            'bn'
          )
        ).toBe('মুশ্রাফুল হক')
      })
    })
  })

  describe('Query data to draft transformation', () => {
    describe('birth event', () => {
      it('transfroms birth event query data to draft', () => {
        const queryData: GQLBirthEventSearchSet = {
          id: '1',
          type: 'birth',
          registration: {
            contactNumber: '+8801711111111',
            trackingId: 'BZX12Y',
            status: 'DECLARED'
          },
          childName: [
            {
              firstNames: 'Muhammad',
              familyName: 'Ashraful',
              use: 'en'
            },
            {
              firstNames: 'মুহাম্মাদ',
              familyName: 'আশরাফুল',
              use: 'bn'
            }
          ]
        }

        const transformedDraftDeclaration =
          transformSearchQueryDataToDraft(queryData)
        expect(transformedDraftDeclaration).toEqual({
          id: '1',
          data: {
            registration: {
              contactPoint: {
                nestedFields: {
                  registrationPhone: '+8801711111111'
                }
              }
            },
            child: {
              firstNamesEng: 'Muhammad',
              familyNameEng: 'Ashraful',
              firstNames: 'মুহাম্মাদ',
              familyName: 'আশরাফুল'
            }
          },
          event: 'birth',
          trackingId: 'BZX12Y',
          submissionStatus: 'DECLARED'
        })
      })
    })
    describe('death event', () => {
      it('transfroms death event query data to draft', () => {
        const queryData: GQLDeathEventSearchSet = {
          id: '1',
          type: 'death',
          registration: {
            contactNumber: '+8801711111111',
            trackingId: 'BZX12Y',
            status: 'DECLARED'
          },
          deceasedName: [
            {
              firstNames: 'Muhammad',
              familyName: 'Ashraful',
              use: 'en'
            },
            {
              firstNames: 'মুহাম্মাদ',
              familyName: 'আশরাফুল',
              use: 'bn'
            }
          ]
        }

        const transformedDraftDeclaration =
          transformSearchQueryDataToDraft(queryData)
        expect(transformedDraftDeclaration).toEqual({
          id: '1',
          data: {
            registration: {
              contactPoint: {
                nestedFields: {
                  registrationPhone: '+8801711111111'
                }
              }
            },
            deceased: {
              firstNamesEng: 'Muhammad',
              familyNameEng: 'Ashraful',
              firstNames: 'মুহাম্মাদ',
              familyName: 'আশরাফুল'
            }
          },
          event: 'death',
          trackingId: 'BZX12Y',
          submissionStatus: 'DECLARED'
        })
      })
    })
  })
})
