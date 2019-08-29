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

export function transformCertificateData(
  transformedSectionData: TransformedData,
  certificateData: ICertificate
) {
  if (!certificateData || !certificateData.collector) {
    return transformedSectionData
  }
  const collector: GQLRelatedPerson = {}
  if (certificateData.collector.type) {
    collector.relationship = certificateData.collector
      .type as GQLRelationshipType
  }
  if (certificateData.collector.relationship) {
    collector.otherRelationship = certificateData.collector
      .relationship as string
    collector.individual = {
      name: [
        {
          use: 'en',
          firstNames: certificateData.collector.firstName,
          familyName: certificateData.collector.lastName
        }
      ],
      identifier: [
        {
          id: certificateData.collector.iD,
          type: certificateData.collector.iDType
        }
      ]
    } as GQLPerson
  }
  if (certificateData.collector.affidavitFile) {
    collector.affidavit = [
      {
        contentType: (certificateData.collector.affidavitFile as IFileValue)
          .type,
        data: (certificateData.collector.affidavitFile as IFileValue).data
      }
    ] as GQLAttachment[]
  }
  transformedSectionData.certificates = [
    {
      ...certificateData,
      collector
    }
  ]
}

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
    transformCertificateData(
      transformedData[sectionId],
      (draftData[sectionId].certificates as ICertificate[])[0]
    )
  }
}
