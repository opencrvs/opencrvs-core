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
import { EventType } from '@client/utils/gateway'
import {
  getDeclarationFullName,
  transformSearchQueryDataToDraft
} from '@client/utils/draftUtils'
import type {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet
} from '@client/utils/gateway-deprecated-do-not-use'
import { createIntl, createIntlCache } from 'react-intl'

const cache = createIntlCache()
const intlEngish = createIntl(
  {
    locale: 'en',
    messages: {}
  },
  cache
)
const intlBangla = createIntl(
  {
    locale: 'bn',
    messages: {}
  },
  cache
)

describe('draftUtils tests', () => {
  describe('getDraftInformantFullName()', () => {
    describe('Birth event', () => {
      it('Returns child english name properly', () => {
        expect(
          getDeclarationFullName(
            {
              id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
              data: {
                child: {
                  firstNames: 'মুশ্রাফুল',
                  familyName: 'হক',
                  firstNamesEng: 'Mushraful',
                  familyNameEng: 'Hoque'
                }
              },
              event: EventType.Birth,
              savedOn: 1558037863335,
              modifiedOn: 1558037867987
            },
            intlEngish
          )
        ).toBe('Mushraful Hoque')
      })
      it('Returns child English name properly even though localed is Bangla', () => {
        expect(
          getDeclarationFullName(
            {
              id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
              data: {
                child: {
                  familyName: 'হক',
                  firstNamesEng: 'Mushraful',
                  familyNameEng: 'Hoque'
                }
              },
              event: EventType.Birth,
              savedOn: 1558037863335,
              modifiedOn: 1558037867987
            },
            intlBangla
          )
        ).toBe('Mushraful Hoque')
      })
    })
    describe('Death event', () => {
      it('Returns deceased english name properly', () => {
        expect(
          getDeclarationFullName(
            {
              id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
              data: {
                deceased: {
                  firstNames: 'মুশ্রাফুল',
                  familyName: 'হক',
                  familyNameEng: 'Hoque'
                }
              },
              event: EventType.Death,
              savedOn: 1558037863335,
              modifiedOn: 1558037867987
            },
            intlBangla
          )
        ).toBe('Hoque')
      })
      it('Returns child English name properly even when the current locale is Bangla', () => {
        expect(
          getDeclarationFullName(
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
              event: EventType.Death,
              savedOn: 1558037863335,
              modifiedOn: 1558037867987
            },
            intlEngish
          )
        ).toBe('Mushraful Hoque')
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
              middleName: 'Ashraful',
              familyName: 'Alam',
              use: 'en'
            },
            {
              firstNames: 'মুহাম্মাদ',
              middleName: 'আশরাফুল',
              familyName: 'আলম',
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
              middleNameEng: 'Ashraful',
              familyNameEng: 'Alam',
              firstNames: 'মুহাম্মাদ',
              middleName: 'আশরাফুল',
              familyName: 'আলম'
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
              middleName: 'Ashraful',
              familyName: 'Alam',
              use: 'en'
            },
            {
              firstNames: 'মুহাম্মাদ',
              middleName: 'আশরাফুল',
              familyName: 'আলম',
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
              middleNameEng: 'Ashraful',
              familyNameEng: 'Alam',
              firstNames: 'মুহাম্মাদ',
              middleName: 'আশরাফুল',
              familyName: 'আলম'
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
