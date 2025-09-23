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

import { UUID } from '../uuid'
import { FullDocumentPath } from '../documents'

export interface IUserName {
  use: string
  family: string
  given: string[]
}

type ObjectId = string

/*
 * Let's add more fields as they are needed
 */
export type User = {
  id: string
  avatar?: {
    data: FullDocumentPath
    type: string
  }
  signature?: FullDocumentPath
  name: IUserName[]
  username: string
  email: string
  role: ObjectId
  practitionerId: string
  primaryOfficeId: UUID
  scope: string[]
  status: string
  creationDate: number
}

export type System = {
  name: string
  createdBy: string
  username: string
  client_id: string
  status: string
  scope: string[]
  sha_secret: string
  type: string
}
