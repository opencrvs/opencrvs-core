import {
  formatLongDate,
  formatDateWithTime
} from '@register/utils/date-formatting'

describe('date formatting tests', () => {
  it('formats long date with or without localization', () => {
    expect(formatLongDate('2018-11-15', 'en', 'L')).toBe('15-11-2018')
    expect(formatLongDate('2018-11-15', 'en', 'LL')).toBe('15 November 2018')

    expect(formatLongDate('2018-11-15', 'bn', 'L')).toBe('১৫-১১-২০১৮')
    expect(formatLongDate('2018-11-15', 'bn', 'LL')).toBe('১৫ নভেম্বর ২০১৮')
  })

  it('formats date that is in number format', () => {
    const date = new Date(2019, 6, 6, 1, 8, 4)
    const int = String(date.getTime())
    expect(formatDateWithTime(int)).toBe('2019-07-06 01:08:04')
  })
})
