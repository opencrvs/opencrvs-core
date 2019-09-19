import { isMobileDevice, contains } from '@register/utils/commonUtils'

describe('Common Utils Test', () => {
  beforeEach(() => {
    ;(isMobileDevice as jest.Mock).mockRestore()
  })

  it('Should simulate Mobile Devise', () => {
    const mobileDevise = isMobileDevice()
    expect(mobileDevise).toBe(true)
  })

  it('Should Simulate Desktop Devise', () => {
    // @ts-ignore
    global.window.outerWidth = 1920
    const mobileDevise = isMobileDevice()
    expect(mobileDevise).toBe(false)
  })

  it('Should return true as string contains one of the supplied words', () => {
    const str = '/drafts/documents'
    const pattern = ['documents', 'affidavit']
    const result = contains(str, pattern)
    expect(result).toBe(true)
  })

  it('Should return false as string doesnt contain one of the supplied words', () => {
    const str = '/drafts/mother-details'
    const pattern = ['documents', 'affidavit']
    const result = contains(str, pattern)
    expect(result).toBe(false)
  })
})
