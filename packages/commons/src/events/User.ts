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

export type User = {
  id: string
  name: { use: string; given: string[]; family: string }[]
  role: string
  /**
   * The filename of the user's signature stored in MinIO, ex: 'a552f64a-31c4-4e78-b44f-292c3179e2ef.png'.
   * This is used to retrieve the signature file from storage.
   */
  signatureFileName?: string
}
