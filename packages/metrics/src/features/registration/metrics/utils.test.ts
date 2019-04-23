import { calculateInterval } from './utils'

it('Should return 365d', () => {
  const interval = calculateInterval(
    '1293818400000000000',
    '1555670997414000000000'
  )
  expect(interval).toBe('365d')
})

it('Should return 30d', () => {
  const interval = calculateInterval(
    '1548957600000000000',
    '1555670997414000000000'
  )
  expect(interval).toBe('30d')
})

it('Should return 7d', () => {
  const interval = calculateInterval(
    '1555696800000000000',
    '1555670997414000000000'
  )
  expect(interval).toBe('7d')
})
