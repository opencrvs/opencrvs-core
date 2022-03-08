/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  GQLAttachment,
  GQLPerson,
  GQLRelatedPerson
} from '@opencrvs/gateway/src/graphql/schema'
import {
  ICertificate,
  IFileValue,
  IFormData,
  IFormField,
  IFormSectionData,
  TransformedData,
  IFormFieldMutationMapFunction
} from '@client/forms'
import { set, omit } from 'lodash'
import { convertToMSISDN } from '@client/forms/utils'

export function transformCertificateData(
  transformedData: TransformedData,
  certificateData: ICertificate,
  sectionId: string
) {
  transformedData[sectionId].certificates = [
    {
      ...omit(certificateData, 'collector')
    }
  ]
  // for collector mapping
  if (certificateData && certificateData.collector) {
    const collector: GQLRelatedPerson = {}
    if (certificateData.collector.type) {
      collector.relationship = certificateData.collector.type as string
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
    transformedData[sectionId].certificates[0].collector = collector
  }
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

  if (draftData[sectionId].presentAtBirthRegistration) {
    transformedData.presentAtBirthRegistration =
      draftData[sectionId].presentAtBirthRegistration
  }

  if (!transformedData[sectionId].status) {
    transformedData[sectionId].status = [
      {
        timestamp: new Date()
      }
    ]
  }

  if (draftData[sectionId].commentsOrNotes) {
    if (!transformedData[sectionId].status[0].comments) {
      transformedData[sectionId].status[0].comments = []
    }
    transformedData[sectionId].status[0].comments.push({
      comment: draftData[sectionId].commentsOrNotes,
      createdAt: new Date()
    })
  }

  if (draftData[sectionId].certificates) {
    transformCertificateData(
      transformedData,
      (draftData[sectionId].certificates as ICertificate[])[0],
      sectionId
    )
  }
}

export const msisdnTransformer =
  (transformedFieldName?: string) =>
  (
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

export const changeHirerchyMutationTransformer =
  (
    transformedFieldName?: string,
    transformerMethod?: IFormFieldMutationMapFunction
  ) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField,
    nestedField: IFormField
  ) => {
    const nestedFieldValueObj: IFormSectionData = (
      draftData[sectionId][field.name] as IFormSectionData
    ).nestedFields as IFormSectionData

    if (transformedFieldName) {
      set(
        transformedData,
        transformedFieldName,
        nestedFieldValueObj[nestedField.name] || ''
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
      transformedData[nestedField.name] =
        nestedFieldValueObj[nestedField.name] || ''
    }

    return transformedData
  }

export const customFieldToQuestionnaireTransformer = (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const valueObj: IFormSectionData = draftData[sectionId][
    field.name
  ] as IFormSectionData
  if (!transformedData.questionnaire) {
    transformedData.questionnaire = []
  }
  transformedData.questionnaire.push({
    fieldName: field.name,
    value: valueObj[field.name]
  })

  return transformedData
}
