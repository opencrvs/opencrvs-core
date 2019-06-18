import { isMobileDevice } from '@register/utils/commonUtils'
describe('Common Utils Test', () => {
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
})
