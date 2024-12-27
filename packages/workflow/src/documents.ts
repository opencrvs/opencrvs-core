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
import fetch from 'node-fetch'
import { DOCUMENTS_URL } from './constants'
import { IAuthHeader, isBase64FileString } from '@opencrvs/commons'
import {
  BirthRegistration,
  DeathRegistration,
  MarriageRegistration
} from '@opencrvs/commons/types'
import { CertifyInput, IssueInput } from './records/validations'

export async function uploadFileToMinio(
  fileData: string,
  authHeader: IAuthHeader
): Promise<string> {
  const suffix = '/upload'
  const request = {
    method: 'POST',
    headers: {
      ...authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fileData: fileData })
  }
  const result = await fetch(`${DOCUMENTS_URL}${suffix}`, request)
  const res = await result.json()
  return res.refUrl
}

export async function uploadCertificateAttachmentsToDocumentsStore<
  T extends CertifyInput | IssueInput
>(certificateDetails: T, authHeader: IAuthHeader): Promise<T> {
  if (
    'affidavit' in certificateDetails.collector &&
    certificateDetails.collector.affidavit
  ) {
    for (const affidavit of certificateDetails.collector.affidavit) {
      affidavit.data = await uploadFileToMinio(affidavit.data, authHeader)
    }
  }
  return certificateDetails
}

function isPresignedUrl(url: string) {
  return url.startsWith('http')
}

function getCanonicalAttachmentURL(url: string) {
  const parsedUrl = new URL(url)
  const filePath = parsedUrl.pathname

  return filePath
}

function uploadOrNormaliseSignatureData(
  signature: string,
  authHeader: IAuthHeader
) {
  if (isBase64FileString(signature)) {
    return uploadFileToMinio(signature, authHeader)
  }

  if (isPresignedUrl(signature)) {
    return getCanonicalAttachmentURL(signature)
  }
  return signature
}

export async function uploadBase64AttachmentsToDocumentsStore(
  record: BirthRegistration | DeathRegistration | MarriageRegistration,
  authHeader: IAuthHeader
) {
  /*
   * @todo input schema and target all AttachmentInput types automatically
   */
  if (record.registration?.informantsSignature) {
    record.registration.informantsSignature =
      await uploadOrNormaliseSignatureData(
        record.registration.informantsSignature,
        authHeader
      )
  }
  if (record.registration?.groomSignature) {
    record.registration.groomSignature = await uploadOrNormaliseSignatureData(
      record.registration.groomSignature,
      authHeader
    )
  }
  if (record.registration?.brideSignature) {
    record.registration.brideSignature = await uploadOrNormaliseSignatureData(
      record.registration.brideSignature,
      authHeader
    )
  }
  if (record.registration?.witnessOneSignature) {
    record.registration.witnessOneSignature =
      await uploadOrNormaliseSignatureData(
        record.registration.witnessOneSignature,
        authHeader
      )
  }
  if (record.registration?.witnessTwoSignature) {
    record.registration.witnessTwoSignature =
      await uploadOrNormaliseSignatureData(
        record.registration.witnessTwoSignature,
        authHeader
      )
  }
  if (record.registration?.attachments) {
    for (const attachment of record.registration.attachments) {
      if (attachment.data && isBase64FileString(attachment.data)) {
        const fileUri = await uploadFileToMinio(attachment.data, authHeader)
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
            const fileUri = await uploadFileToMinio(affidavit.data, authHeader)
            affidavit.data = fileUri
          }
        }
      }
      if (certificate.collector.photo) {
        for (const photo of certificate.collector.photo) {
          if (photo.data && isBase64FileString(photo.data)) {
            const fileUri = await uploadFileToMinio(photo.data, authHeader)
            photo.data = fileUri
          }
        }
      }
    }
  }
  if (record.registration?.correction?.attachments) {
    for (const attachment of record.registration.correction.attachments) {
      if (attachment.data && isBase64FileString(attachment.data)) {
        const fileUri = await uploadFileToMinio(attachment.data, authHeader)
        attachment.data = fileUri
      }
    }
  }
  if (record.registration?.correction?.payment?.attachmentData) {
    const fileUri = await uploadFileToMinio(
      record.registration.correction.payment.attachmentData,
      authHeader
    )
    record.registration.correction.payment.attachmentData = fileUri
  }
  return record
}
