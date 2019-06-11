import { generateUsername } from './service'

describe('.generateUsername()', () => {
  it('generates valid username with given and family names', () => {
    const username = generateUsername(['John', 'Evan'], 'Doe')
    expect(username).toBe('je.doe')
  })

  it('generates valid username with just family name', () => {
    const username = generateUsername([], 'Doe')
    expect(username).toBe('doe')
  })

  it('generates valid username with no spaces', () => {
    const username = generateUsername(['John Mark', 'Evan'], 'van der Linde')
    expect(username).toBe('je.van-der-linde')
  })

  it('throws an error if username is < 3 chars long', () => {
    expect(() => generateUsername([], 'Wu')).toThrowError(
      'username cannot be less than 3 characters, please provide more name details'
    )
  })
})
