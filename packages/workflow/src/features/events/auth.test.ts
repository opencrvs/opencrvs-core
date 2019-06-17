import { isUserAuthorized } from '@workflow/features/events/auth'
import { Events } from '@workflow/features/events/handler'

describe('isUserAuthorized()', () => {
  it('returns true when token scopes match event', () => {
    expect(isUserAuthorized(['xyz', 'register'], Events.BIRTH_MARK_REG)).toBe(
      true
    )
  })

  it('returns true when multiple token scopes match event', () => {
    expect(
      isUserAuthorized(['declare', 'register'], Events.BIRTH_MARK_VOID)
    ).toBe(true)
  })

  it('returns false when token scopes DO NOT match event', () => {
    expect(isUserAuthorized(['xyz', 'abc'], Events.BIRTH_MARK_REG)).toBe(false)
  })

  it('returns false when token scopes are not defined', () => {
    expect(
      // @ts-ignore
      isUserAuthorized(undefined, Events.BIRTH_MARK_REG)
    ).toBe(false)
  })

  it('returns false when event is not known', () => {
    expect(
      // @ts-ignore
      isUserAuthorized(['xyz', 'register'], '???')
    ).toBe(false)
  })
})
