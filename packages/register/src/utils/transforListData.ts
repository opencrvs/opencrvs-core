import {
  GQLHumanName,
  GQLRegWorkflow,
  GQLLocation,
  GQLBirthRegistration,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema'
import * as moment from 'moment'
import { getTokenPayload, getToken } from 'src/utils/authUtils'
import { queries } from 'src/profile/queries'

export interface IMyRecord {
  [key: string]: unknown
}

export async function fetchMyRecords(): Promise<IMyRecord[]> {
  const payload = getTokenPayload(getToken())
  const userId = (payload && payload.sub) || ''
  const queryData = await queries.fetchUserRecords(userId)
  const data = queryData.data as GQLQuery
  if (!data.listUserRecentRecords) {
    return []
  } else {
    return transformData(data.listUserRecentRecords)
  }
}
export function transformData(data: Array<GQLBirthRegistration | null>) {
  if (!data) {
    return []
  }

  return data.map((reg: GQLBirthRegistration) => {
    const childNames = (reg.child && (reg.child.name as GQLHumanName[])) || []
    const namesMap = (names: GQLHumanName[]) =>
      names.filter(Boolean).reduce((prevNamesMap, name) => {
        if (!name.use) {
          /* tslint:disable:no-string-literal */
          prevNamesMap['default'] = `${name.firstNames} ${
            /* tslint:enable:no-string-literal */
            name.familyName
          }`.trim()
          return prevNamesMap
        }

        prevNamesMap[name.use] = `${name.firstNames} ${name.familyName}`.trim()
        return prevNamesMap
      }, {})
    const lang = 'bn'
    return {
      id: reg.id,
      name:
        (namesMap(childNames)[lang] as string) ||
        /* tslint:disable:no-string-literal */
        (namesMap(childNames)['default'] as string) ||
        /* tslint:enable:no-string-literal */
        '',
      dob: (reg.child && reg.child.birthDate) || '',
      date_of_application: moment(reg.createdAt).format('YYYY-MM-DD'),
      registrationNumber:
        (reg.registration && reg.registration.registrationNumber) || '',
      tracking_id: (reg.registration && reg.registration.trackingId) || '',
      createdAt: reg.createdAt as string,
      status:
        reg.registration &&
        reg.registration.status &&
        reg.registration.status.map(status => {
          return {
            type: status && status.type,
            practitionerName:
              (status &&
                status.user &&
                (namesMap(status.user.name as GQLHumanName[])[
                  lang
                ] as string)) ||
              (status &&
                status.user &&
                /* tslint:disable:no-string-literal */
                (namesMap(status.user.name as GQLHumanName[])[
                  'default'
                ] as string)) ||
              /* tslint:enable:no-string-literal */
              '',
            timestamp: status && moment(status.timestamp).format('YYYY-MM-DD'),
            practitionerRole: status && status.user && status.user.role,
            location: status && status.location && status.location.name
          }
        }),
      declaration_status:
        reg.registration &&
        reg.registration.status &&
        (reg.registration.status[0] as GQLRegWorkflow).type,
      event: 'birth',
      duplicates: reg.registration && reg.registration.duplicates,
      location:
        (reg.registration &&
          reg.registration.status &&
          (reg.registration.status[0] as GQLRegWorkflow).location &&
          ((reg.registration.status[0] as GQLRegWorkflow)
            .location as GQLLocation).name) ||
        ''
    }
  })
}
