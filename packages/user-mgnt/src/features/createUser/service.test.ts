import { generateUsername } from './service'

describe('.generateUsername()', () => {
  it('generates valid username with given and family names', () => {
    const names = [{ given: ['John', 'Evan'], family: 'Doe', use: 'en' }]
    const username = generateUsername(names)
    expect(username).toBe('je.doe')
  })

  it('generates valid username with just family name', () => {
    const names = [{ given: [], family: 'Doe', use: 'en' }]
    const username = generateUsername(names)
    expect(username).toBe('doe')
  })

  it('generates valid username with no spaces', () => {
    const names = [
      { given: ['John Mark', 'Evan'], family: 'van der Linde', use: 'en' }
    ]
    const username = generateUsername(names)
    expect(username).toBe('je.van-der-linde')
  })

  it('throws an error if username is < 3 chars long', () => {
    const names = [{ given: [], family: 'Wu', use: 'en' }]
    expect(() => generateUsername(names)).toThrowError(
      'username cannot be less than 3 characters, please provide more name details'
    )
  })
})
