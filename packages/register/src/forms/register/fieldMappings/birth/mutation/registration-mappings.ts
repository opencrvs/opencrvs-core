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
  TransformedData,
  IFormFieldMutationMapFunction
} from '@register/forms'
import { set } from 'lodash'
import { callingCountries } from 'country-data'

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

const convertToMSISDN = (phoneWithoutCountryCode: string) => {
  const countryCode =
    callingCountries[window.config.COUNTRY.toUpperCase()].countryCallingCodes[0]

  return phoneWithoutCountryCode.startsWith('0')
    ? `${countryCode}${phoneWithoutCountryCode.substring(1)}`
    : `${countryCode}${phoneWithoutCountryCode}`
}

export const msisdnTransformer = (transformedFieldName?: string) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const fieldName = transformedFieldName ? transformedFieldName : field.name

  set(
    transformedData,
    fieldName,
    convertToMSISDN(draftData[sectionId][field.name] as string)
  )

  return transformedData
}

export const changeHirerchyMutationTransformer = (
  transformedFieldName?: string,
  transformerMethod?: IFormFieldMutationMapFunction
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField,
  nestedField: IFormField
) => {
  let nestedFieldValueObj: IFormSectionData = (draftData[sectionId][
    field.name
  ] as IFormSectionData).nestedFields as IFormSectionData

  if (transformedFieldName) {
    set(
      transformedData,
      transformedFieldName,
      nestedFieldValueObj[nestedField.name]
    )

    if (transformerMethod) {
      transformerMethod(
        transformedData,
        draftData[sectionId][field.name] as IFormData,
        'nestedFields',
        nestedField
      )
    }
  } else {
    transformedData[nestedField.name] = nestedFieldValueObj[nestedField.name]
  }

  return transformedData
}
