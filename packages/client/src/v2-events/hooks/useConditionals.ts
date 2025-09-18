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
import {
  ActionUpdate,
  UserContext,
  EventState,
  FieldConfig,
  isFieldVisible
} from '@opencrvs/commons/client'
import { getToken, getTokenPayload } from '@client/utils/authUtils'

function getContext(): UserContext {
  const token = getToken()
  const tokenPayload = getTokenPayload(token)

  // @todo: add locations?
  return { user: tokenPayload ?? undefined }
}

export function useConditionals() {
  const context = getContext()

  return {
    isFieldVisible: (field: FieldConfig, form: ActionUpdate | EventState) =>
      isFieldVisible(field, form, context)
  }
}
