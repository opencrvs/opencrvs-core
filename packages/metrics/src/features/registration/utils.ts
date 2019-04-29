import * as moment  from 'moment'

export function getAgeInDays(dob: string) {
  const todaysDate = moment(Date.now())
  const eventDate = moment(dob)
  return todaysDate.diff(eventDate, 'd')
}
