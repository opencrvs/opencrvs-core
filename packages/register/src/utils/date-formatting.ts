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
