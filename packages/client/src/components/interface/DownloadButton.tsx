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
import { useDispatch, useSelector } from 'react-redux'
import { InternalRefetchQueriesInclude, useApolloClient } from '@apollo/client'
import { AvatarSmall } from '@client/components/Avatar'
import {
  downloadDeclaration,
  DOWNLOAD_STATUS,
  SUBMISSION_STATUS
} from '@client/declarations'
import { Action } from '@client/forms'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { conflictsMessages } from '@client/i18n/messages/views/conflicts'
import { IStoreState } from '@client/store'
import { useOnlineStatus } from '@client/utils'
import type { AssignmentData } from '@client/utils/gateway'
import { EventType } from '@client/utils/gateway'
import { Button } from '@opencrvs/components/lib/Button'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { Download } from '@opencrvs/components/lib/icons'
import { ConnectionError } from '@opencrvs/components/lib/icons/ConnectionError'
import React from 'react'
import { useIntl } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { useModal } from '@client/hooks/useModal'
import { usePermissions } from '@client/hooks/useAuthorization'
import styled from 'styled-components'
import { useDeclaration } from '@client/declarations/selectors'

interface IDownloadConfig {
  event: string
  compositionId: string
  action: Action
  assignment?: AssignmentData
  refetchQueries?: InternalRefetchQueriesInclude
}

interface DownloadButtonProps {
  id?: string
  className?: string
  downloadConfigs: IDownloadConfig
  status?: DOWNLOAD_STATUS
  declarationStatus: SUBMISSION_STATUS
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

const LOADING_STATUSES = [
  DOWNLOAD_STATUS.READY_TO_DOWNLOAD,
  DOWNLOAD_STATUS.DOWNLOADING,
  DOWNLOAD_STATUS.READY_TO_UNASSIGN,
  DOWNLOAD_STATUS.UNASSIGNING
]

const AssignModal: React.FC<{
  close: (result: boolean) => void
}> = ({ close }) => {
  const intl = useIntl()

  return (
    <ResponsiveModal
      id="assignment"
      show
      title={intl.formatMessage(conflictsMessages.assignTitle)}
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
      autoHeight
      responsive={false}
      preventClickOnParent
      handleClose={() => close(false)}
    >
      {intl.formatMessage(conflictsMessages.assignDesc)}
    </ResponsiveModal>
  )
}

export function DownloadButton({
  id,
  status,
  className,
  declarationStatus,
  downloadConfigs: {
    assignment: declarationAssignment,
    event,
    compositionId,
    action
  }
}: DownloadButtonProps) {
  const intl = useIntl()
  const client = useApolloClient()
  const isOnline = useOnlineStatus()
  const dispatch = useDispatch()
  const practitionerId = useSelector<IStoreState, string | undefined>(
    (state) => {
      const { userDetails } = state.profile
      return userDetails?.practitionerId
    }
  )
  const [modal, openModal] = useModal()
  const { isRecordActionable } = usePermissions()

  const declaration = useDeclaration(compositionId)
  const assignment = declarationAssignment ?? declaration?.assignmentStatus

  const assignedToSomeoneElse =
    assignment && assignment.practitionerId !== practitionerId
  const assignedToMe = assignment?.practitionerId === practitionerId

  const isFailed =
    status === DOWNLOAD_STATUS.FAILED ||
    status === DOWNLOAD_STATUS.FAILED_NETWORK

  const download = () =>
    dispatch(
      downloadDeclaration(
        event.toLowerCase() as unknown as EventType,
        compositionId,
        action,
        client
      )
    )

  const handleDownload = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (!assignment) {
      const assign = await openModal<boolean>((close) => (
        <AssignModal close={close} />
      ))
      if (assign) {
        download()
      }
    } else if (assignedToMe && status !== DOWNLOAD_STATUS.DOWNLOADED) {
      download()
    }
    e.stopPropagation()
  }

  if (status && LOADING_STATUSES.includes(status)) {
    return (
      <StatusIndicator
        isLoading={true}
        className={className}
        id={`${id}-download-loading`}
      >
        <Spinner id={`action-loading-${id}`} size={24} />
      </StatusIndicator>
    )
  }

  if (!isOnline) {
    return (
      <NoConnectionViewContainer>
        <div
          data-tip
          data-for={`${id}_noConnection`}
          data-class="no-connection"
        >
          <ConnectionError id={`${id}_noConnection`} key={id} />
        </div>
        <ReactTooltip id={`${id}_noConnection`} place="top" effect="solid">
          {intl.formatMessage(constantsMessages.noConnection)}
        </ReactTooltip>
      </NoConnectionViewContainer>
    )
  }

  return (
    <>
      <DownloadAction
        type="icon"
        id={`${id}-icon${isFailed ? `-failed` : ``}`}
        onClick={handleDownload}
        className={className}
        aria-label={intl.formatMessage(constantsMessages.assignRecord)}
        disabled={!isRecordActionable(declarationStatus as SUBMISSION_STATUS)}
      >
        {assignment &&
        (assignedToSomeoneElse ||
          (assignedToMe && status === DOWNLOAD_STATUS.DOWNLOADED)) ? (
          <AvatarSmall
            avatar={{
              data: assignment.avatarURL,
              type: 'image/jpeg'
            }}
          />
        ) : (
          <Download isFailed={isFailed} />
        )}
      </DownloadAction>
      {modal}
    </>
  )
}
