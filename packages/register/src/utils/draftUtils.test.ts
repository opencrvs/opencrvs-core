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
