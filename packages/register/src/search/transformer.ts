import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet,
  GQLHumanName,
  GQLQuery,
  GQLRegStatus
} from '@opencrvs/gateway/src/graphql/schema'
import { IntlShape } from 'react-intl'
import { createNamesMap } from '@register/utils/data-formatting'
import { formatLongDate } from '@register/utils/date-formatting'
import { IApplication } from '@register/applications'

export const transformData = (
  data: GQLQuery,
  intl: IntlShape,
  outboxApplications: IApplication[] = [],
  checkStatus: string[] = []
) => {
  const { locale } = intl
  if (!data.searchEvents || !data.searchEvents.results) {
    return []
  }

  return data.searchEvents.results
    .filter((req): req is GQLEventSearchSet => req !== null)
    .filter((reg: GQLEventSearchSet) => {
      if (outboxApplications.length === 0) {
        return true
      }
      for (const application of outboxApplications) {
        if (
          reg.id === application.id &&
          checkStatus.includes(application.submissionStatus || '')
        ) {
          return false
        }
      }

      return true
    })
    .map((reg: GQLEventSearchSet) => {
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
      const status =
        assignedReg.registration &&
        (assignedReg.registration.status as GQLRegStatus)
      return {
        id: assignedReg.id,
        name:
          (createNamesMap(names)[locale] as string) ||
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
          (assignedReg.registration && assignedReg.registration.trackingId) ||
          '',
        event: assignedReg.type || '',
        declarationStatus: status || '',
        contactNumber:
          (assignedReg.registration &&
            assignedReg.registration.contactNumber) ||
          '',
        duplicates:
          (assignedReg.registration && assignedReg.registration.duplicates) ||
          [],
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
        createdAt:
          assignedReg.registration && assignedReg.registration.createdAt,
        modifiedAt:
          assignedReg.registration && assignedReg.registration.modifiedAt
      }
    })
}
