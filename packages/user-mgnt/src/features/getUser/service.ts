import {
  Extension,
  findExtension,
  OPENCRVS_SPECIFICATION_URL
} from '@opencrvs/commons/types'
import { getFromFhir } from '../createUser/service'

/**
 * Users can have a signature extension that contains the storage key to their signature image.
 *
 * @returns storage key in /:bucketName/:objectName format.  e.g. /ocrvs/123123123123.png
 */
export function findSignatureStorageKey(extensions: Extension[] | undefined) {
  const signature = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/employee-signature`,
    extensions || []
  )

  console.log('signature extension', signature)
  return signature?.valueAttachment.url
}

export async function getPractitionerSignature(
  token: string,
  practitionerId: string
) {
  const practitioner = await getFromFhir(
    token,
    `/Practitioner/${practitionerId}`
  )

  return findSignatureStorageKey(practitioner.extension)
}
