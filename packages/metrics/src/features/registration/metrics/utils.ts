import * as moment from 'moment'

export const YEARLY_INTERVAL = '365d'
export const MONTHLY_INTERVAL = '30d'
export const WEEKLY_INTERVAL = '7d'

export const LABEL_FOMRAT = {
  [YEARLY_INTERVAL]: 'YYYY',
  [MONTHLY_INTERVAL]: 'MMMM',
  [WEEKLY_INTERVAL]: 'DD-MM-YYYY'
}

export interface IPoint {
  time: string
  count: number
}

export const ageIntervals = [
  { title: '45d', minAgeInDays: -1, maxAgeInDays: 45 },
  { title: '46d - 1yr', minAgeInDays: 46, maxAgeInDays: 365 },
  { title: '1yr', minAgeInDays: 366, maxAgeInDays: 730 },
  { title: '2yr', minAgeInDays: 731, maxAgeInDays: 1095 },
  { title: '3yr', minAgeInDays: 1096, maxAgeInDays: 1460 },
  { title: '4yr', minAgeInDays: 1461, maxAgeInDays: 1825 },
  { title: '5yr', minAgeInDays: 1826, maxAgeInDays: 2190 },
  { title: '6yr', minAgeInDays: 2191, maxAgeInDays: 2555 },
  { title: '7yr', minAgeInDays: 2556, maxAgeInDays: 2920 },
  { title: '8yr', minAgeInDays: 2921, maxAgeInDays: 3285 },
  { title: '9r', minAgeInDays: 3286, maxAgeInDays: 3650 },
  { title: '10yr', minAgeInDays: 3651, maxAgeInDays: 4015 }
]

export const calculateInterval = (startTime: string, endTime: string) => {
  const timeStartInMil = parseInt(startTime.substr(0, 13))
  const timeEndInMil = parseInt(endTime.substr(0, 13))
  const diffInDays = moment(timeEndInMil).diff(timeStartInMil, 'days')

  if (diffInDays > 365) {
    return YEARLY_INTERVAL
  } else if (diffInDays > 30 && diffInDays <= 365) {
    return MONTHLY_INTERVAL
  } else {
    return WEEKLY_INTERVAL
  }
}
