import { formatLongDate } from '@register/utils/date-formatting'

describe('date formatting tests', () => {
  it('formats long date with or without localization', () => {
    expect(formatLongDate('2018-11-15', 'en', 'L')).toBe('15-11-2018')
    expect(formatLongDate('2018-11-15', 'en', 'LL')).toBe('15 November 2018')

    expect(formatLongDate('2018-11-15', 'bn', 'L')).toBe('১৫-১১-২০১৮')
    expect(formatLongDate('2018-11-15', 'bn', 'LL')).toBe('১৫ নভেম্বর ২০১৮')
  })
})
