/* eslint-disable import/order */
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
import { Button } from '@opencrvs/components/lib/Button'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { AvatarSmall } from '@client/components/Avatar'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { conflictsMessages } from '@client/i18n/messages/views/conflicts'
import { useOnlineStatus } from '@client/utils'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { Download, Downloaded } from '@opencrvs/components/lib/icons'
import { ConnectionError } from '@opencrvs/components/lib/icons/ConnectionError'
import React from 'react'
import { useIntl } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { useModal } from '@client/hooks/useModal'
import styled from 'styled-components'
import { ActionType, EventIndex } from '@opencrvs/commons/client'
import {
  AssignmentStatus,
  getAssignmentStatus,
  getUsersFullName
} from '../utils'
import { useAuthentication } from '@client/utils/userUtils'
import { useEvents } from '../features/events/useEvents/useEvents'
import { useUsers } from '../hooks/useUsers'
import { useActionMenuItems } from '../features/workqueues/EventOverview/components/useActionMenuItems'

interface DownloadButtonProps {
  id?: string
  className?: string
  event: EventIndex
  isDraft?: boolean
}

const StatusIndicator = styled.div<{
  isLoading?: boolean
}>`
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`
const DownloadAction = styled(Button)`
  border-radius: 50%;
  height: 40px;
  width: 40px;
  & > div {
    padding: 0px 0px;
  }
`
const NoConnectionViewContainer = styled.div`
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  .no-connection {
    ::after {
      display: none;
    }
  }
`

function AssignModal({ close }: { close: (result: boolean) => void }) {
  const intl = useIntl()

  return (
    <ResponsiveModal
      autoHeight
      preventClickOnParent
      show
      actions={[
        <Button
          key="assign-btn"
          id="assign"
          type="positive"
          onClick={() => close(true)}
        >
          {intl.formatMessage(buttonMessages.assign)}
        </Button>,
        <Button
          key="cancel-btn"
          id="cancel"
          type="tertiary"
          onClick={() => close(false)}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>
      ]}
      handleClose={() => close(false)}
      id="assignment"
      responsive={false}
      title={intl.formatMessage(conflictsMessages.assignTitle)}
    >
      {intl.formatMessage(conflictsMessages.assignDesc)}
    </ResponsiveModal>
  )
}

export function DownloadButton({
  id,
  className,
  event,
  isDraft = false
}: DownloadButtonProps) {
  const intl = useIntl()

  const isOnline = useOnlineStatus()

  const [modal, openModal] = useModal()
  const authentication = useAuthentication()
  const { getEvent, actions } = useEvents()
  const users = useUsers()
  const user = users.getUser.useQuery(event.assignedTo || '', {
    enabled: !!event.assignedTo
  }).data

  const actionMenuItems = useActionMenuItems(event)
  const assignmentStatus = getAssignmentStatus(event, authentication?.sub)

  const eventDocument = getEvent.findFromCache(event.id)

  if (eventDocument.isFetching) {
    return (
      <StatusIndicator
        className={className}
        id={`${id}-download-loading`}
        isLoading={true}
      >
        <Spinner id={`action-loading-${id}`} size={24} />
      </StatusIndicator>
    )
  }
  const isFailed = eventDocument.isError

  if (!isOnline) {
    return (
      <NoConnectionViewContainer>
        <div
          data-tip
          data-class="no-connection"
          data-for={`${id}_noConnection`}
        >
          <ConnectionError key={id} id={`${id}_noConnection`} />
        </div>
        <ReactTooltip effect="solid" id={`${id}_noConnection`} place="top">
          {intl.formatMessage(constantsMessages.noConnection)}
        </ReactTooltip>
      </NoConnectionViewContainer>
    )
  }

  if (!authentication) {
    return null
  }
  const isDownloadedToMe =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF &&
    eventDocument.isFetched

  if (isDraft && isDownloadedToMe) {
    return <Downloaded />
  }

  const isAssignedToSomeoneElse =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_OTHERS

  const download = async () =>
    actions.assignment.assign.mutate({
      eventId: event.id,
      assignedTo: authentication.sub,
      refetchEvent: eventDocument.refetch
    })

  const handleDownload = async () => {
    if (
      assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF &&
      !eventDocument.isFetched
    ) {
      void download()
      return
    }

    if (assignmentStatus === AssignmentStatus.UNASSIGNED) {
      const assign = await openModal<boolean>((close) => (
        <AssignModal close={close} />
      ))
      if (assign) {
        void download()
      }
    }
  }

  return (
    <>
      <DownloadAction
        aria-label={intl.formatMessage(constantsMessages.assignRecord)}
        className={className}
        disabled={
          !(
            actionMenuItems.find(({ type }) => type === ActionType.UNASSIGN) ||
            actionMenuItems.find(({ type }) => type === ActionType.ASSIGN) ||
            assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF
          )
        }
        id={`${id}-icon${isFailed ? `-failed` : ``}`}
        type="icon"
        onClick={handleDownload}
      >
        {isAssignedToSomeoneElse || isDownloadedToMe ? (
          <AvatarSmall
            key={user?.avatar || 'default'}
            avatar={
              user?.avatar
                ? {
                    data: user.avatar,
                    type: 'image/jpeg' // This is never used internally
                  }
                : undefined
            }
            name={user && getUsersFullName(user.name, intl.locale)}
          />
        ) : (
          <Download isFailed={isFailed} />
        )}
      </DownloadAction>
      {modal}
    </>
  )
}
