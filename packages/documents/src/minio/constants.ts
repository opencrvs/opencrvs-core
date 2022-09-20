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
export const MINIO_HOST = process.env.MINIO_HOST || 'localhost'
export const MINIO_PORT = process.env.MINIO_PORT || 9000
export const MINIO_BUCKET = process.env.MINIO_BUCKET || 'ocrvs'
export const MINIO_BUCKET_REGION = process.env.MINIO_BUCKET_REGION || 'local'
