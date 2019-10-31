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
import { getDraftApplicantFullName } from '@register/utils/draftUtils'
import { Event } from '@register/forms'

describe('draftUtils tests', () => {
  describe('getDraftApplicantFullName()', () => {
    describe('Birth event', () => {
      it('Returns child english name properly', () => {
        expect(
          getDraftApplicantFullName({
            id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
            data: {
              child: {
                firstNames: 'মুশ্রাফুল',
                familyName: 'হক',
                firstNamesEng: 'Mushraful',
                familyNameEng: 'Hoque'
              }
            },
            event: Event.BIRTH,
            savedOn: 1558037863335,
            modifiedOn: 1558037867987
          })
        ).toBe('Mushraful Hoque')
      })
      it('Returns child bangla name properly', () => {
        expect(
          getDraftApplicantFullName(
            {
              id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
              data: {
                child: {
                  familyName: 'হক',
                  firstNamesEng: 'Mushraful',
                  familyNameEng: 'Hoque'
                }
              },
              event: Event.BIRTH,
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
          getDraftApplicantFullName({
            id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
            data: {
              deceased: {
                firstNames: 'মুশ্রাফুল',
                familyName: 'হক',
                familyNameEng: 'Hoque'
              }
            },
            event: Event.DEATH,
            savedOn: 1558037863335,
            modifiedOn: 1558037867987
          })
        ).toBe('Hoque')
      })
      it('Returns child bangla name properly', () => {
        expect(
          getDraftApplicantFullName(
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
              event: Event.DEATH,
              savedOn: 1558037863335,
              modifiedOn: 1558037867987
            },
            'bn'
          )
        ).toBe('মুশ্রাফুল হক')
      })
    })
  })
})
