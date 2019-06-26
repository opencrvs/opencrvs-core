import moment from 'moment'

const config: { [key: string]: moment.LocaleSpecification } = {
  en: {
    longDateFormat: {
      L: 'DD-MM-YYYY',
      LT: 'HH:mm',
      LTS: 'HH:mm:ss',
      LL: 'DD MMMM YYYY',
      LLL: 'D MMMM YYYY HH:mm',
      LLLL: 'dddd D MMMM YYYY HH:mm'
    }
  },
  bn: {
    longDateFormat: {
      L: 'DD-MM-YYYY',
      LT: 'HH:mm',
      LTS: 'HH:mm:ss',
      LL: 'DD MMMM YYYY',
      LLL: 'D MMMM YYYY HH:mm',
      LLLL: 'dddd D MMMM YYYY HH:mm'
    }
  }
}

export const formatLongDate = (
  date: string,
  locale: string = 'en',
  formatString: string = 'L'
) => {
  moment.updateLocale(locale, config[locale])
  return moment(date).format(formatString)
}

export const formatDateWithTime = (date: string): string => {
  const d = new Date(Number(date))
  let month = String(d.getMonth() + 1)
  let day = String(d.getDate())
  let year = String(d.getFullYear())
  let hour = String(d.getHours())
  let minute = String(d.getMinutes())
  let second = String(d.getSeconds())

  if (month.length < 2) {
    month = '0' + month
  }
  if (day.length < 2) {
    day = '0' + day
  }
  if (hour.length < 2) {
    hour = '0' + hour
  }
  if (minute.length < 2) {
    minute = '0' + minute
  }
  if (second.length < 2) {
    second = '0' + second
  }
  return [year, month, day].join('-') + ' ' + [hour, minute, second].join(':')
}
