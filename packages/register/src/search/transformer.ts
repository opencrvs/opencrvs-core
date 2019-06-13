import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet,
  GQLHumanName,
  GQLQuery,
  GQLRegStatus
} from '@opencrvs/gateway/src/graphql/schema'
import { InjectedIntl } from 'react-intl'
import { createNamesMap } from '@register/utils/data-formatting'
import { formatLongDate } from '@register/utils/date-formatting'

export const transformData = (data: GQLQuery, intl: InjectedIntl) => {
  const { locale } = intl
  if (!data.searchEvents || !data.searchEvents.results) {
    return []
  }

  return data.searchEvents.results.map((reg: GQLEventSearchSet | null) => {
    let birthReg
    let deathReg
    let names
    let dateOfEvent
    const assignedReg = reg as GQLEventSearchSet
    if (assignedReg.registration && assignedReg.type === 'Birth') {
      birthReg = reg as GQLBirthEventSearchSet
      names = (birthReg && (birthReg.childName as GQLHumanName[])) || []
      dateOfEvent = birthReg && birthReg.dateOfBirth
    } else {
      deathReg = reg as GQLDeathEventSearchSet
      names = (deathReg && (deathReg.deceasedName as GQLHumanName[])) || []
      dateOfEvent = deathReg && deathReg.dateOfDeath
    }
    const lang = 'bn'
    const status =
      assignedReg.registration &&
      (assignedReg.registration.status as GQLRegStatus)
    return {
      id: assignedReg.id,
      name:
        (createNamesMap(names)[lang] as string) ||
        /* eslint-disable no-string-literal */
        (createNamesMap(names)['default'] as string) ||
        /* eslint-enable no-string-literal */
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
      dateOfEvent,
      registrationNumber:
        (assignedReg.registration &&
          assignedReg.registration.registrationNumber) ||
        '',
      trackingId:
        (assignedReg.registration && assignedReg.registration.trackingId) || '',
      event: assignedReg.type || '',
      declarationStatus: status || '',
      contactNumber:
        (assignedReg.registration && assignedReg.registration.contactNumber) ||
        '',
      duplicates:
        (assignedReg.registration && assignedReg.registration.duplicates) || [],
      rejectionReasons:
        (status === 'REJECTED' &&
          assignedReg.registration &&
          assignedReg.registration.reason) ||
        '',
      rejectionComment:
        (status === 'REJECTED' &&
          assignedReg.registration &&
          assignedReg.registration.comment) ||
        '',
      createdAt: assignedReg.registration && assignedReg.registration.createdAt,
      modifiedAt:
        assignedReg.registration && assignedReg.registration.modifiedAt
    }
  })
}
