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
import React from 'react'
import { useIntl } from 'react-intl'
import {
  ActionType,
  EventIndex,
  WorkqueueActionType
} from '@opencrvs/commons/client'
import { Button, Icon } from '@opencrvs/components'
import { useCurrentBackTo } from '@client/v2-events/features/events/useEventFormNavigation'
import { withSuspense } from '../../../components/withSuspense'
import { useGetWorkqueueActionConfiguration } from '../../workqueues/Actions/useGetActionConfiguration'

const ACTION_ICONS: Record<
  WorkqueueActionType,
  React.ComponentProps<typeof Icon>['name']
> = {
  [ActionType.READ]: 'Eye',
  [ActionType.DELETE]: 'Trash',
  [ActionType.DECLARE]: 'PaperPlaneTilt',
  [ActionType.REGISTER]: 'Stamp',
  [ActionType.EDIT]: 'PencilSimpleLine',
  [ActionType.REJECT]: 'ArrowCounterClockwise',
  [ActionType.MARK_AS_DUPLICATE]: 'Files',
  [ActionType.ARCHIVE]: 'Archive',
  [ActionType.UNARCHIVE]: 'ArchiveTray',
  [ActionType.PRINT_CERTIFICATE]: 'Printer',
  [ActionType.REQUEST_CORRECTION]: 'NotePencil'
}

/**
 * Component rendering CTA icon button for an event in search result.
 *
 * @returns next available action cta based on the given event.
 */
function ActionCtaComponent({
  event,
  actionType
}: {
  event: EventIndex
  actionType: WorkqueueActionType
}) {
  const intl = useIntl()
  const backTo = useCurrentBackTo()

  const config = useGetWorkqueueActionConfiguration(event, actionType)
  const label = intl.formatMessage(config.label)

  return (
    <Button
      aria-label={label}
      disabled={'disabled' in config && Boolean(config.disabled)}
      title={label}
      type="icon"
      onClick={async () => config.onClick(backTo)}
    >
      <Icon name={ACTION_ICONS[actionType]} />
    </Button>
  )
}

export const ActionCta = withSuspense(React.memo(ActionCtaComponent))
