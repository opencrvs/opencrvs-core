import {
  calculateDays,
  timeElapsed
} from '@register/views/PrintCertificate/calculatePrice'

describe('calculateDays, timeElapsed tests', async () => {
  it('timeElapsedInWords function returns required time duration in words', () => {
    // @ts-ignore
    Date.now = jest.fn(() => new Date('2019-01-01'))

    let days = calculateDays('1985-08-18')

    let time = timeElapsed(days)
    expect(time.value).toBe(33)
    expect(time.unit).toBe('Year')
    days = calculateDays('2018-12-16')
    time = timeElapsed(days)
    expect(time.value).toBe(16)
    expect(time.unit).toBe('Day')

    days = calculateDays('2018-10-16')
    time = timeElapsed(days)
    expect(time.value).toBe(2)
    expect(time.unit).toBe('Month')
  })
})
