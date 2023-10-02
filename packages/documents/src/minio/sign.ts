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

import { presignSignatureV4 } from 'minio/dist/main/signing'
import {
  MINIO_ACCESS_KEY,
  MINIO_BUCKET_REGION,
  MINIO_SECRET_KEY,
  MINIO_PRESIGNED_URL_EXPIRY_IN_SECOND,
  MINIO_URL,
  MINIO_PROTOCOL
} from './constants'

export function signFileUrl(uri: string) {
  return presignSignatureV4(
    {
      headers: {
        host: MINIO_URL
      },
      protocol: MINIO_PROTOCOL,
      method: 'GET',
      path: uri
    },
    MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY,
    undefined,
    MINIO_BUCKET_REGION,
    new Date(),
    MINIO_PRESIGNED_URL_EXPIRY_IN_SECOND
  )
}
