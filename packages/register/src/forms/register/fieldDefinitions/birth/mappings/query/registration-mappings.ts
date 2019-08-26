import { IFormData, Event } from '@register/forms'
import {
  GQLRegWorkflow,
  GQLRegStatus
} from '@opencrvs/gateway/src/graphql/schema'

export function getRegistrationSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (queryData[sectionId].trackingId) {
    transformedData[sectionId].trackingId = queryData[sectionId].trackingId
  }

  if (queryData[sectionId].registrationNumber) {
    transformedData[sectionId].registrationNumber =
      queryData[sectionId].registrationNumber
  }

  if (queryData[sectionId].type && queryData[sectionId].type === 'BIRTH') {
    transformedData[sectionId].type = Event.BIRTH
  }

  if (queryData[sectionId].status) {
    const registrationStatus = (queryData[sectionId]
      .status as GQLRegWorkflow[]).find(status => {
      return status.type && (status.type as GQLRegStatus) === 'REGISTERED'
    })
    if (registrationStatus) {
      transformedData[sectionId] = {
        ...transformedData[sectionId],
        regStatus: {
          type: registrationStatus.type || '',
          officeName:
            (registrationStatus.office && registrationStatus.office.name) || '',
          officeAlias:
            (registrationStatus.office &&
              registrationStatus.office.alias &&
              registrationStatus.office.alias.join(' ')) ||
            '',
          officeAddressLevel3:
            (registrationStatus.office &&
              registrationStatus.office.address &&
              registrationStatus.office.address.district) ||
            '',
          officeAddressLevel4:
            (registrationStatus.office &&
              registrationStatus.office.address &&
              registrationStatus.office.address.state) ||
            ''
        }
      }
    }
  }
}
