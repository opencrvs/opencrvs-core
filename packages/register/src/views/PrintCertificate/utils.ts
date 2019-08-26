import { Event, IFormData } from '@register/forms'
import moment from 'moment'
import { dynamicMessages } from '@register/i18n/messages/views/certificate'

const FREE_PERIOD = window.config.CERTIFICATE_PRINT_CHARGE_FREE_PERIOD
const CHARGE_UP_LIMIT = window.config.CERTIFICATE_PRINT_CHARGE_UP_LIMIT

const LOWEST_CHARGE = window.config.CERTIFICATE_PRINT_LOWEST_CHARGE
const HIGHEST_CHARGE = window.config.CERTIFICATE_PRINT_HIGHEST_CHARGE

const MONTH_IN_DAYS = 30
const YEAR_IN_DAYS = 365

interface IRange {
  start: number
  end?: number
  value: number
}

interface IDayRange {
  rangeData: { [key in Event]?: IRange[] }
  getValue: (event: Event, days: number) => IRange['value']
}

const ranges: IRange[] = [
  { start: 0, end: FREE_PERIOD, value: 0 },
  {
    start: FREE_PERIOD + 1,
    end: CHARGE_UP_LIMIT,
    value: LOWEST_CHARGE
  },
  { start: CHARGE_UP_LIMIT + 1, value: HIGHEST_CHARGE }
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

export function getServiceMessage(event: Event, eventDate: string) {
  const days = calculateDays(eventDate)
  return days > CHARGE_UP_LIMIT
    ? dynamicMessages[`${event}ServiceAfter`]
    : dynamicMessages[`${event}ServiceBetween`]
}

export function isFreeOfCost(event: Event, eventDate: string): boolean {
  const days = calculateDays(eventDate)
  const result = dayRange.getValue(event, days)
  return result === 0
}

export function getEventDate(data: IFormData, event: Event) {
  switch (event) {
    case Event.BIRTH:
      return data.child.childBirthDate as string
    case Event.DEATH:
      return data.deathEvent.deathDate as string
  }
}

export function getEvent(eventType: string | undefined) {
  switch (eventType && eventType.toLowerCase()) {
    case 'birth':
    default:
      return Event.BIRTH
    case 'death':
      return Event.DEATH
  }
}
