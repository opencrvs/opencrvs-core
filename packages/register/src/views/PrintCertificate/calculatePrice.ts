import { Event } from '@register/forms'
import moment from 'moment'

const MONTH_IN_DAYS = 30
const YEAR_IN_DAYS = 365

interface IRange {
  start: number
  end?: number
  value: number
}

interface IDayRange {
  rangeData: { [key in Event]?: IRange[] }
  getValue: (event: string, days: number) => IRange['value']
}

const ranges: IRange[] = [
  { start: 0, end: 45, value: 0 },
  {
    start: 46,
    end: 5 * YEAR_IN_DAYS,
    value: 25
  },
  { start: 5 * YEAR_IN_DAYS + 1, value: 50 }
]

function getValue(
  this: IDayRange,
  event: Event,
  check: number
): IRange['value'] {
  const rangeByEvent = this.rangeData[event] as IRange[]
  const foundRange = rangeByEvent.find(range =>
    range.end
      ? check >= range.start && check <= range.end
      : check >= range.start
  )
  return foundRange ? foundRange.value : rangeByEvent[0].value
}

export const dayRange: IDayRange = {
  rangeData: {
    [Event.BIRTH]: ranges,
    [Event.DEATH]: ranges
  },
  // @ts-ignore
  getValue
}

export function calculateDays(doE: string) {
  const todaysDate = moment(Date.now())
  const eventDate = moment(doE)
  const diffInDays = todaysDate.diff(eventDate, 'days')

  return diffInDays
}

export function timeElapsed(days: number) {
  const output: { unit: string; value: number } = { value: 0, unit: 'Day' }

  const year = Math.floor(days / YEAR_IN_DAYS)
  const month = Math.floor(days / MONTH_IN_DAYS)

  if (year > 0) {
    output.value = year
    output.unit = 'Year'
  } else if (month > 0) {
    output.value = month
    output.unit = 'Month'
  } else {
    output.value = days
  }

  return output
}

export function calculatePrice(event: Event, eventDate: string) {
  const days = calculateDays(eventDate)
  const result = dayRange.getValue(event, days)

  return result.toFixed(2)
}
