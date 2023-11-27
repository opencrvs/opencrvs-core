/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { IAuthHeader, isBase64FileString } from '@opencrvs/commons'
import { Composition } from '@opencrvs/commons/types'
import {
  fetchDocuments,
  uploadBase64ToMinio
} from '@gateway/features/documents/service'
import { getTokenPayload, getUser } from '@gateway/features/user/utils'
import {
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput,
  GQLMarriageRegistrationInput
} from '@gateway/graphql/schema'

export async function uploadBase64AttachmentsToDocumentsStore(
  record:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput,
  authHeader: IAuthHeader
) {
  /*
   * @todo input schema and target all AttachmentInput types automatically
   */
  if (
    record.registration?.informantsSignature &&
    isBase64FileString(record.registration?.informantsSignature)
  ) {
    record.registration.informantsSignature = await uploadBase64ToMinio(
      record.registration.informantsSignature,
      authHeader
    )
  }
  if (
    record.registration?.groomSignature &&
    isBase64FileString(record.registration?.groomSignature)
  ) {
    record.registration.groomSignature = await uploadBase64ToMinio(
      record.registration.groomSignature,
      authHeader
    )
  }
  if (
    record.registration?.brideSignature &&
    isBase64FileString(record.registration?.brideSignature)
  ) {
    record.registration.brideSignature = await uploadBase64ToMinio(
      record.registration.brideSignature,
      authHeader
    )
  }
  if (
    record.registration?.witnessOneSignature &&
    isBase64FileString(record.registration?.witnessOneSignature)
  ) {
    record.registration.witnessOneSignature = await uploadBase64ToMinio(
      record.registration.witnessOneSignature,
      authHeader
    )
  }
  if (
    record.registration?.witnessTwoSignature &&
    isBase64FileString(record.registration?.witnessTwoSignature)
  ) {
    record.registration.witnessTwoSignature = await uploadBase64ToMinio(
      record.registration.witnessTwoSignature,
      authHeader
    )
  }
  if (record.registration?.attachments) {
    for (const attachment of record.registration.attachments) {
      if (attachment.data && isBase64FileString(attachment.data)) {
        const fileUri = await uploadBase64ToMinio(attachment.data, authHeader)
        attachment.data = fileUri
      }
    }
  }
  if (record.registration?.certificates) {
    for (const certificate of record.registration.certificates) {
      if (!certificate?.collector) {
        continue
      }
      if (certificate.collector.affidavit) {
        for (const affidavit of certificate.collector.affidavit) {
          if (affidavit.data && isBase64FileString(affidavit.data)) {
            const fileUri = await uploadBase64ToMinio(
              affidavit.data,
              authHeader
            )
            affidavit.data = fileUri
          }
        }
      }
      if (certificate.collector.photo) {
        for (const photo of certificate.collector.photo) {
          if (photo.data && isBase64FileString(photo.data)) {
            const fileUri = await uploadBase64ToMinio(photo.data, authHeader)
            photo.data = fileUri
          }
        }
      }
    }
  }
  if (record.registration?.correction?.attachments) {
    for (const attachment of record.registration.correction.attachments) {
      if (attachment.data && isBase64FileString(attachment.data)) {
        const fileUri = await uploadBase64ToMinio(attachment.data, authHeader)
        attachment.data = fileUri
      }
    }
  }
  if (record.registration?.correction?.payment?.attachmentData) {
    const fileUri = await uploadBase64ToMinio(
      record.registration.correction.payment.attachmentData,
      authHeader
    )
    record.registration.correction.payment.attachmentData = fileUri
  }
  return record
}

export async function getPresignedUrlFromUri(
  fileUri: string,
  authHeader: IAuthHeader
) {
  const response = (await fetchDocuments(
    '/presigned-url',
    authHeader,
    'POST',
    JSON.stringify({ fileUri })
  )) as { presignedURL: string }

  return response.presignedURL
}

export async function removeDuplicatesFromComposition(
  composition: Composition,
  compositionId: string,
  duplicateId?: string
) {
  if (duplicateId) {
    const removeAllDuplicates = compositionId === duplicateId
    const updatedRelatesTo =
      composition.relatesTo &&
      composition.relatesTo.filter((relatesTo) => {
        return (
          relatesTo.code !== 'duplicate' ||
          (!removeAllDuplicates &&
            relatesTo.targetReference &&
            relatesTo.targetReference.reference !==
              `Composition/${duplicateId}`)
        )
      })
    composition.relatesTo = updatedRelatesTo
    return composition
  } else {
    composition.relatesTo = []
    return composition
  }
}

export async function setCertificateCollector(
  details:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput,
  authHeader: IAuthHeader
) {
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  const userId = tokenPayload.sub
  const userDetails = await getUser({ userId }, authHeader)
  const name = userDetails.name.map((nameItem) => ({
    use: nameItem.use,
    familyName: nameItem.family,
    firstNames: nameItem.given.join(' ')
  }))
  const role = userDetails.role.labels.find(({ lang }) => lang === 'en')?.label

  details?.registration?.certificates?.forEach((certificate) => {
    if (!certificate) return
    if (certificate.collector?.relationship === 'PRINT_IN_ADVANCE') {
      certificate.collector = {
        name,
        relationship: 'PRINT_IN_ADVANCE',
        otherRelationship: role
      }
    }
    return certificate
  })

  return details
}
