import * as moment from 'moment'

type YYYY_MM_DD = string
type ISO_DATE = string

export function getAgeInDays(dateOfBirth: YYYY_MM_DD) {
  return getDurationInDays(dateOfBirth, new Date().toISOString())
}

export function getDurationInDays(from: ISO_DATE, to: ISO_DATE) {
  const toDate = moment(to)
  const fromDate = moment(from)
  return toDate.diff(fromDate, 'days')
}

export function getDurationInSeconds(from: ISO_DATE, to: ISO_DATE) {
  const toDate = moment(to)
  const fromDate = moment(from)
  return toDate.diff(fromDate, 'seconds')
}
