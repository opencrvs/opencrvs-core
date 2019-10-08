import * as moment from 'moment'

type YYYY_MM_DD = string

export function getAgeInDays(dateOfBirth: YYYY_MM_DD) {
  return getDurationInDays(dateOfBirth, new Date().toISOString())
}

export function getDurationInDays(from: YYYY_MM_DD, to: YYYY_MM_DD) {
  const toDate = moment(to)
  const fromDate = moment(from)
  return toDate.diff(fromDate, 'days')
}

export function getDurationInSeconds(from: YYYY_MM_DD, to: YYYY_MM_DD) {
  const toDate = moment(to)
  const fromDate = moment(from)
  return toDate.diff(fromDate, 'seconds')
}
