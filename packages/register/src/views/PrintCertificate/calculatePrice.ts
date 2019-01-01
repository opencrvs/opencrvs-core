const DAY: number = 1000 * 60 * 60 * 24
const YEAR: number = 365 * DAY

function parseDate(dateString: string) {
  const ymd = dateString.split('-')

  const year: number = Number(ymd[0])
  const month: number = Number(ymd[1]) - 1
  const day: number = Number(ymd[2])

  return new Date(year, month, day)
}

function calculateDays(dob: string) {
  const todaysDate = new Date()
  const dateOfBirth = parseDate(dob)

  const differenceInDays = Math.round(
    (Number(todaysDate) - Number(dateOfBirth)) / DAY
  )

  return differenceInDays
}

interface IRange {
  start: number
  end?: number
  value: number
}

const ranges: IRange[] = []

const between45Days: IRange = { start: 0, end: 45, value: 0 }
const between45DaysTo5yr: IRange = { start: 46, end: 5 * YEAR, value: 25 }
const above5years: IRange = { start: 5 * YEAR + 1, value: 50 }

ranges.push(between45Days, between45DaysTo5yr, above5years)

const betweenRange = (range: IRange, check: number) =>
  range.end ? check >= range.start && check <= range.end : check >= range.start

export function calculatePrice(dateOfBirth: string) {
  const days = calculateDays(dateOfBirth)

  let result
  result = ranges.find(range => betweenRange(range, days))
  return result && result.value
}
