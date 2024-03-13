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
import * as React from 'react'
import styled from 'styled-components'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { IActionObject } from '@opencrvs/components/lib/Workqueue'
import { Download } from '@opencrvs/components/lib/icons'
import { Button } from '@opencrvs/components/lib/Button'
import { connect } from 'react-redux'
import {
  downloadDeclaration,
  DOWNLOAD_STATUS,
  unassignDeclaration,
  deleteDeclaration as deleteDeclarationAction
} from '@client/declarations'
import { Action } from '@client/forms'
import { Event, SystemRoleType } from '@client/utils/gateway'
import {
  ApolloClient,
  InternalRefetchQueriesInclude,
  useApolloClient
} from '@apollo/client'
import { Downloaded } from '@opencrvs/components/lib/icons/Downloaded'
import type { GQLAssignmentData } from '@client/utils/gateway-deprecated-do-not-use'
import { IStoreState } from '@client/store'
import { AvatarSmall } from '@client/components/Avatar'
import {
  FIELD_AGENT_ROLES,
  ROLE_REGISTRATION_AGENT
} from '@client/utils/constants'
import { Dispatch } from 'redux'
import { useIntl, IntlShape, MessageDescriptor } from 'react-intl'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { conflictsMessages } from '@client/i18n/messages/views/conflicts'
import { ConnectionError } from '@opencrvs/components/lib/icons/ConnectionError'
import { useOnlineStatus } from '@client/utils'
import ReactTooltip from 'react-tooltip'

const { useState, useCallback, useMemo } = React
interface IDownloadConfig {
  event: string
  compositionId: string
  action: Action
  assignment?: GQLAssignmentData
  refetchQueries?: InternalRefetchQueriesInclude
  declarationStatus?: string
}

interface DownloadButtonProps {
  id?: string
  className?: string
  downloadConfigs: IDownloadConfig
  status?: DOWNLOAD_STATUS
}

interface IConnectProps {
  userRole?: SystemRoleType
  userId?: string
}
interface IDispatchProps {
  downloadDeclaration: typeof downloadDeclaration
  unassignDeclaration: typeof unassignDeclaration
  deleteDeclaration: typeof deleteDeclarationAction
}

type HOCProps = IConnectProps & IDispatchProps

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
interface IModalAction extends Omit<IActionObject, 'label'> {
  type: 'success' | 'danger' | 'tertiary'
  id: string
  label: MessageDescriptor
}
interface AssignModalOptions {
  title: MessageDescriptor
  actions: IModalAction[]
  content: MessageDescriptor
  contentArgs?: Record<string, string>
}

function getAssignModalOptions(
  assignment: GQLAssignmentData | undefined,
  callbacks: {
    onAssign: () => void
    onUnassign: () => void
    onCancel: () => void
  },
  userRole?: SystemRoleType,
  isDownloadedBySelf?: boolean
): AssignModalOptions {
  const assignAction: IModalAction = {
    id: 'assign',
    label: buttonMessages.assign,
    type: 'success',
    handler: callbacks.onAssign
  }
  const unassignAction: IModalAction = {
    id: 'unassign',
    label: buttonMessages.unassign,
    type: 'danger',
    handler: callbacks.onUnassign
  }
  const cancelAction: IModalAction = {
    id: 'cancel',
    label: buttonMessages.cancel,
    type: 'tertiary',
    handler: callbacks.onCancel
  }

  if (isDownloadedBySelf) {
    return {
      title: conflictsMessages.unassignTitle,
      content: conflictsMessages.selfUnassignDesc,
      actions: [cancelAction, unassignAction]
    }
  } else if (assignment) {
    if (
      userRole === SystemRoleType.LocalRegistrar ||
      userRole === SystemRoleType.NationalRegistrar
    ) {
      return {
        title: conflictsMessages.unassignTitle,
        content: conflictsMessages.regUnassignDesc,
        contentArgs: {
          name: [assignment.firstName, assignment.lastName].join(' '),
          officeName: assignment.officeName || ''
        },
        actions: [cancelAction, unassignAction]
      }
    }
    return {
      title: conflictsMessages.assignedTitle,
      content: conflictsMessages.assignedDesc,
      contentArgs: {
        name: [assignment.firstName, assignment.lastName].join(' '),
        officeName: assignment.officeName || ''
      },
      actions: []
    }
  } else {
    return {
      title: conflictsMessages.assignTitle,
      content: conflictsMessages.assignDesc,
      actions: [cancelAction, assignAction]
    }
  }
}
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

function renderModalAction(action: IModalAction, intl: IntlShape): JSX.Element {
  let buttonType: 'positive' | 'negative' | 'tertiary'
  if (action.type === 'success') {
    buttonType = 'positive' as const
  } else if (action.type === 'danger') {
    buttonType = 'negative'
  } else {
    buttonType = 'tertiary'
  }

  return (
    <Button id={action.id} type={buttonType} onClick={action.handler}>
      {intl.formatMessage(action.label)}
    </Button>
  )
}

function DownloadButtonComponent(props: DownloadButtonProps & HOCProps) {
  const intl = useIntl()
  const client = useApolloClient()
  const isOnline = useOnlineStatus()
  const LOADING_STATUSES = useMemo(function () {
    return [
      DOWNLOAD_STATUS.READY_TO_DOWNLOAD,
      DOWNLOAD_STATUS.DOWNLOADING,
      DOWNLOAD_STATUS.READY_TO_UNASSIGN,
      DOWNLOAD_STATUS.UNASSIGNING
    ]
  }, [])
  const {
    id,
    status,
    className,
    downloadConfigs,
    downloadDeclaration,
    userRole,
    userId,
    unassignDeclaration,
    deleteDeclaration
  } = props
  const { assignment, compositionId } = downloadConfigs
  const [assignModal, setAssignModal] = useState<AssignModalOptions | null>(
    null
  )
  const download = useCallback(() => {
    const { event, compositionId, action } = downloadConfigs
    downloadDeclaration(
      event.toLowerCase() as unknown as Event,
      compositionId,
      action,
      client
    )
  }, [downloadConfigs, client, downloadDeclaration])
  const hideModal = useCallback(() => setAssignModal(null), [])
  const unassign = useCallback(async () => {
    if (assignment) {
      unassignDeclaration(compositionId, client)
    } else {
      deleteDeclaration(compositionId, client)
    }
  }, [
    compositionId,
    client,
    unassignDeclaration,
    assignment,
    deleteDeclaration
  ])
  const isFailed = useMemo(
    () =>
      status === DOWNLOAD_STATUS.FAILED ||
      status === DOWNLOAD_STATUS.FAILED_NETWORK,
    [status]
  )

  const onClickDownload = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (
        (assignment?.userId !== userId ||
          status === DOWNLOAD_STATUS.DOWNLOADED) &&
        (downloadConfigs.declarationStatus !== 'VALIDATED' ||
          userRole !== ROLE_REGISTRATION_AGENT) &&
        !FIELD_AGENT_ROLES.includes(String(userRole))
      ) {
        setAssignModal(
          getAssignModalOptions(
            assignment,
            {
              onAssign: () => {
                download()
                hideModal()
              },
              onUnassign: () => {
                unassign()
                hideModal()
              },
              onCancel: hideModal
            },
            userRole,
            status === DOWNLOAD_STATUS.DOWNLOADED
          )
        )
      } else if (status !== DOWNLOAD_STATUS.DOWNLOADED) {
        download()
      }
      e.stopPropagation()
    },
    [
      assignment,
      userRole,
      download,
      userId,
      status,
      unassign,
      hideModal,
      downloadConfigs
    ]
  )

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
        onClick={onClickDownload}
        className={className}
        aria-label={intl.formatMessage(constantsMessages.assignRecord)}
      >
        {status === DOWNLOAD_STATUS.DOWNLOADED ? (
          <Downloaded />
        ) : assignment && assignment.userId !== userId ? (
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
      {assignModal !== null && (
        <ResponsiveModal
          id="assignment"
          show
          title={intl.formatMessage(assignModal.title)}
          actions={assignModal.actions.map((action) =>
            renderModalAction(action, intl)
          )}
          autoHeight
          responsive={false}
          preventClickOnParent
          handleClose={hideModal}
        >
          {intl.formatMessage(assignModal.content, assignModal.contentArgs)}
        </ResponsiveModal>
      )}
    </>
  )
}

const mapStateToProps = (state: IStoreState): IConnectProps => ({
  userRole: state.profile.userDetails?.systemRole,
  userId: state.profile.userDetails?.userMgntUserID
})

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: DownloadButtonProps
): IDispatchProps => ({
  downloadDeclaration: (
    event: Event,
    compositionId: string,
    action: Action,
    client: ApolloClient<any>
  ) => dispatch(downloadDeclaration(event, compositionId, action, client)),
  deleteDeclaration: (id: string, client: ApolloClient<any>) =>
    dispatch(deleteDeclarationAction(id, client)),
  unassignDeclaration: (id: string, client: ApolloClient<any>) =>
    dispatch(
      unassignDeclaration(id, client, ownProps.downloadConfigs.refetchQueries)
    )
})

export const DownloadButton = connect(
  mapStateToProps,
  mapDispatchToProps
)(DownloadButtonComponent)
