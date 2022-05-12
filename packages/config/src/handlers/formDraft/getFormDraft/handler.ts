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
import * as Hapi from '@hapi/hapi'
import FormDraft, { IFormDraft } from '@config/models/formDraft'
import { internal } from '@hapi/boom'

export default async function getFormDrafts(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let formDrafts: IFormDraft[]
  try {
    formDrafts = await FormDraft.find().exec()
  } catch (error) {
    throw internal(error.message)
  }
  return formDrafts
}
