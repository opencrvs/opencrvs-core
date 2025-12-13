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
import { useSelector } from 'react-redux'
import {
  isActionAvailable,
  ActionType,
  TokenUserType,
  getCurrentEventState,
  getActionConfig,
  EventDocument,
  UUID
} from '@opencrvs/commons/client'
import { getUserDetails } from '@client/profile/profileSelectors'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { useEventConfiguration } from '../useEventConfiguration'

/**
 * Logic to check whether direct register (declare + register) is possible.
 * We do this by 'looking in to the future' by applying the would-be actions to the event,
 * and checking if the register action is still allowed.
 */
export function useCanDirectlyRegister(event: EventDocument) {
  const userDetails = useSelector(getUserDetails)
  const validatorContext = useValidatorContext()
  const { eventConfiguration } = useEventConfiguration(event.type)
  const declaration = useEventFormData((state) => state.getFormValues())
  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()

  if (!userDetails) {
    return false
  }

  const eventAfterDeclare = {
    ...event,
    actions: event.actions.concat({
      type: ActionType.DECLARE,
      id: 'placeholder' as UUID,
      transactionId: 'placeholder' as UUID,
      createdByUserType: TokenUserType.enum.user,
      createdByRole: userDetails.role.id,
      declaration,
      annotation,
      createdAt: new Date().toISOString(),
      createdBy: userDetails.id,
      originalActionId: null,
      status: 'Accepted',
      createdBySignature: undefined,
      createdAtLocation: userDetails.primaryOffice.id as UUID
    })
  }

  const eventIndexAfterDeclare = getCurrentEventState(
    eventAfterDeclare,
    eventConfiguration
  )

  const registerActionConfig = getActionConfig({
    eventConfiguration,
    actionType: ActionType.REGISTER
  })

  if (!registerActionConfig) {
    return false
  }

  return isActionAvailable(
    registerActionConfig,
    eventIndexAfterDeclare,
    validatorContext
  )
}
