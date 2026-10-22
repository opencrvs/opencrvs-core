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
  ActionType,
  canUserNotifyEvent,
  EventDocument,
  getActionReview,
  getDeclaration,
  getNotificationForm
} from '@opencrvs/commons/client'
import { getScope } from '@client/profile/profileSelectors'
import { useEventConfiguration } from '../../useEventConfiguration'

/**
 * Form and review the Edit action is done against. A user who can notify the event type
 * edits the notification form, since their edit ends in a NOTIFY. Others edit the declaration form.
 * A role can not both notify and declare an event type, see `defineRoles`.
 */
export function useEditForm(event: EventDocument) {
  const scopes = useSelector(getScope) ?? []
  const { eventConfiguration } = useEventConfiguration(event.type)
  const isNotifier = canUserNotifyEvent(scopes, event.type)

  const formConfig = isNotifier
    ? getNotificationForm(eventConfiguration)
    : getDeclaration(eventConfiguration)

  const reviewConfig = getActionReview(
    eventConfiguration,
    isNotifier ? ActionType.NOTIFY : ActionType.DECLARE
  )

  if (!reviewConfig) {
    throw new Error('Review config not found')
  }

  return { eventConfiguration, formConfig, reviewConfig, isNotifier }
}
