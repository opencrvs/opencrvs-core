import {
  GQLAttachment,
  GQLPerson,
  GQLRelatedPerson,
  GQLRelationshipType
} from '@opencrvs/gateway/src/graphql/schema'
import {
  ICertificate,
  IFileValue,
  IFormData,
  IFormField,
  IFormSectionData,
  TransformedData
} from '@register/forms'
import { set } from 'lodash'

export function transformCertificateData(
  transformedData: TransformedData,
  certificateData: ICertificate,
  sectionId: string
) {
  if (!certificateData || !certificateData.collector) {
    return transformedData
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
  transformedData[sectionId].certificates = [
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
      transformedData,
      (draftData[sectionId].certificates as ICertificate[])[0],
      sectionId
    )
  }
}

export const changeHirerchyTransformer = (transformedFieldName?: string) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField,
  nestedField: IFormField
) => {
  const nestedFieldValueObj: IFormSectionData = (draftData[sectionId][
    field.name
  ] as IFormSectionData).nestedFields as IFormSectionData
  if (transformedFieldName) {
    set(
      transformedData,
      transformedFieldName,
      nestedFieldValueObj[nestedField.name]
    )
  } else {
    transformedData[nestedField.name] = nestedFieldValueObj[nestedField.name]
  }

  return transformedData
}
