import {
  IFormData,
  ICertificate,
  IFileValue,
  TransformedData
} from '@register/forms'
import {
  GQLRelatedPerson,
  GQLRelationshipType,
  GQLPerson,
  GQLAttachment
} from '@opencrvs/gateway/src/graphql/schema'

export function setBirthRegistrationSectionTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string
) {
  if (draftData[sectionId].trackingId) {
    transformedData[sectionId].trackingId = draftData[sectionId].trackingId
  }

  if (draftData[sectionId].registrationNumber) {
    transformedData[sectionId].registrationNumber =
      draftData[sectionId].registrationNumber
  }

  if (!transformedData[sectionId].status) {
    transformedData[sectionId].status = [
      {
        timestamp: new Date()
      }
    ]
  }

  if (draftData[sectionId].certificates) {
    const certificate = (draftData[sectionId].certificates as ICertificate[])[0]
    if (certificate.collector) {
      const collector: GQLRelatedPerson = {}
      if (certificate.collector.type) {
        collector.relationship = certificate.collector
          .type as GQLRelationshipType
      }
      if (certificate.collector.relationship) {
        collector.otherRelationship = certificate.collector
          .relationship as string
        collector.individual = {
          name: [
            {
              use: 'en',
              firstNames: certificate.collector.firstName,
              familyName: certificate.collector.lastName
            }
          ],
          identifier: [
            {
              id: certificate.collector.iD,
              type: certificate.collector.iDType
            }
          ]
        } as GQLPerson
      }
      if (certificate.collector.affidavitFile) {
        collector.affidavit = [
          {
            contentType: (certificate.collector.affidavitFile as IFileValue)
              .type,
            data: (certificate.collector.affidavitFile as IFileValue).data
          }
        ] as GQLAttachment[]
      }
      transformedData[sectionId].certificates = [
        {
          ...certificate,
          collector
        }
      ]
    }
  }
}
