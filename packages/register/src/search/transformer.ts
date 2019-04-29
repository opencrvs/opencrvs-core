import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet,
  GQLHumanName,
  GQLQuery,
  GQLRegStatus
} from '@opencrvs/gateway/src/graphql/schema'
import { InjectedIntl } from 'react-intl'
import { createNamesMap } from 'utils/data-formatting'
import { formatLongDate } from 'utils/date-formatting'

export const transformData = (data: GQLQuery, intl: InjectedIntl) => {
  const { locale } = intl
  if (!data.searchEvents || !data.searchEvents.results) {
    return []
  }

  return data.searchEvents.results.map((reg: GQLEventSearchSet) => {
    let birthReg
    let deathReg
    let names
    if (reg.registration && reg.type === 'Birth') {
      birthReg = reg as GQLBirthEventSearchSet
      names = (birthReg && (birthReg.childName as GQLHumanName[])) || []
    } else {
      deathReg = reg as GQLDeathEventSearchSet
      names = (deathReg && (deathReg.deceasedName as GQLHumanName[])) || []
    }
    const lang = 'bn'
    const status = reg.registration && (reg.registration.status as GQLRegStatus)
    return {
      id: reg.id,
      name:
        (createNamesMap(names)[lang] as string) ||
        /* tslint:disable:no-string-literal */
        (createNamesMap(names)['default'] as string) ||
        /* tslint:enable:no-string-literal */
        '',
      dob:
        (birthReg &&
          birthReg.dateOfBirth &&
          formatLongDate(birthReg.dateOfBirth, locale)) ||
        '',
      dod:
        (deathReg &&
          deathReg.dateOfDeath &&
          formatLongDate(deathReg.dateOfDeath, locale)) ||
        '',
      date_of_application: formatLongDate(
        reg.registration && reg.registration.dateOfApplication,
        locale
      ),
      registrationNumber:
        (reg.registration && reg.registration.registrationNumber) || '',
      tracking_id: (reg.registration && reg.registration.trackingId) || '',
      event: reg.type,
      declaration_status: status,
      rejection_reasons:
        (status === 'REJECTED' &&
          reg.registration &&
          reg.registration.reason) ||
        '',
      rejection_comment:
        (status === 'REJECTED' &&
          reg.registration &&
          reg.registration.comment) ||
        ''
    }
  })
}
