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
import * as React from 'react'
import styled from '@client/styledComponents'
import {
  Spinner,
  ResponsiveModal,
  IActionObject
} from '@opencrvs/components/lib/interface'
import { Download } from '@opencrvs/components/lib/icons'
import {
  CircleButton,
  TertiaryButton,
  SuccessButton,
  DangerButton
} from '@opencrvs/components/lib/buttons'
import { connect } from 'react-redux'
import {
  downloadDeclaration,
  DOWNLOAD_STATUS,
  unassignDeclaration
} from '@client/declarations'
import { Event, Action } from '@client/forms'
import { withApollo, WithApolloClient } from 'react-apollo'
import { Downloaded } from '@opencrvs/components/lib/icons/Downloaded'
import { GQLAssignmentData } from '@opencrvs/gateway/src/graphql/schema'
import { IStoreState } from '@client/store'
import { AvatarVerySmall } from '@client/components/Avatar'
import { ROLE_LOCAL_REGISTRAR } from '@client/utils/constants'
import { Dispatch } from 'redux'
import ApolloClient from 'apollo-client'
import { useIntl, IntlShape, MessageDescriptor } from 'react-intl'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { conflictsMessages } from '@client/i18n/messages/views/conflicts'
import { ConnectionError } from '@opencrvs/components/lib/icons/ConnectionError'
import {
  withOnlineStatus,
  IOnlineStatusProps
} from '@client/views/OfficeHome/LoadingIndicator'
import ReactTooltip from 'react-tooltip'

const { useState, useCallback, useMemo } = React
interface IDownloadConfig {
  event: string
  compositionId: string
  action: Action
  assignment?: GQLAssignmentData
}

interface DownloadButtonProps {
  id?: string
  className?: string
  downloadConfigs: IDownloadConfig
  status?: DOWNLOAD_STATUS
}

interface IConnectProps {
  userRole?: string
  userId?: string
}
interface IDispatchProps {
  downloadDeclaration: typeof downloadDeclaration
  unassignDeclaration: typeof unassignDeclaration
}

type HOCProps = IConnectProps & IDispatchProps & WithApolloClient<{}>

const StatusIndicator = styled.div<{
  isLoading?: boolean
}>`
  display: flex;
  flex-grow: 0;
  align-items: center;
  max-width: 152px;
  justify-content: ${({ isLoading }) =>
    isLoading ? `space-between` : `flex-end`};
`
const DownloadAction = styled(CircleButton)`
  border-radius: 50%;
  height: 40px;
  width: 40px;
  & > div {
    padding: 0px 0px;
  }
`
interface IModalAction extends Omit<IActionObject, 'label'> {
  type: 'success' | 'danger' | 'tertiary'
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
  userRole?: string,
  isDownloadedBySelf?: boolean
): AssignModalOptions {
  if (isDownloadedBySelf) {
    return {
      title: conflictsMessages.unassignTitle,
      content: conflictsMessages.selfUnassignDesc,
      actions: [
        {
          label: buttonMessages.cancel,
          type: 'tertiary',
          handler: callbacks.onCancel
        },
        {
          label: buttonMessages.unassign,
          type: 'danger',
          handler: callbacks.onUnassign
        }
      ]
    }
  } else if (assignment) {
    if (userRole === ROLE_LOCAL_REGISTRAR) {
      return {
        title: conflictsMessages.unassignTitle,
        content: conflictsMessages.regUnassignDesc,
        contentArgs: {
          name: [assignment.firstName, assignment.lastName].join(' '),
          officeName: assignment.officeName || ''
        },
        actions: [
          {
            label: buttonMessages.cancel,
            type: 'tertiary',
            handler: callbacks.onCancel
          },
          {
            label: buttonMessages.unassign,
            type: 'danger',
            handler: callbacks.onUnassign
          }
        ]
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
      actions: [
        {
          label: buttonMessages.cancel,
          type: 'tertiary',
          handler: callbacks.onCancel
        },
        {
          label: buttonMessages.assign,
          type: 'success',
          handler: callbacks.onAssign
        }
      ]
    }
  }
}
const NoConnectionViewContainer = styled.div`
  .no-connection {
    ::after {
      display: none;
    }
  }
`

function renderModalAction(action: IModalAction, intl: IntlShape): JSX.Element {
  let Button
  if (action.type === 'success') {
    Button = SuccessButton
  } else if (action.type === 'danger') {
    Button = DangerButton
  } else {
    Button = TertiaryButton
  }
  return (
    <Button onClick={action.handler}>{intl.formatMessage(action.label)}</Button>
  )
}

function DownloadButtonComponent(
  props: DownloadButtonProps & HOCProps & IOnlineStatusProps
) {
  const intl = useIntl()
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
    client,
    downloadDeclaration,
    userRole,
    userId,
    unassignDeclaration,
    isOnline
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
    unassignDeclaration(compositionId, client)
  }, [compositionId, client, unassignDeclaration])

  const onClickDownload = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (
        assignment?.userId != userId ||
        status === DOWNLOAD_STATUS.DOWNLOADED
      ) {
        setAssignModal(
          getAssignModalOptions(
            assignment,
            {
              onAssign: () => {
                download()
                hideModal()
              },
              onUnassign: async () => {
                unassign()
                hideModal()
              },
              onCancel: hideModal
            },
            userRole,
            status === DOWNLOAD_STATUS.DOWNLOADED
          )
        )
      } else {
        download()
      }
      e.stopPropagation()
    },
    [assignment, userRole, download, userId, status, unassign, hideModal]
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
        id={`${id}-icon`}
        onClick={onClickDownload}
        className={className}
      >
        {status === DOWNLOAD_STATUS.DOWNLOADED ? (
          <Downloaded />
        ) : assignment && assignment.userId != userId ? (
          <AvatarVerySmall
            avatar={{
              data: `${window.config.API_GATEWAY_URL}files/avatar/${assignment.userId}.jpg`,
              type: 'image/jpeg'
            }}
          />
        ) : (
          <Download
            isFailed={
              status === DOWNLOAD_STATUS.FAILED ||
              status === DOWNLOAD_STATUS.FAILED_NETWORK
            }
          />
        )}
      </DownloadAction>
      {assignModal !== null && (
        <ResponsiveModal
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
  userRole: state.profile.userDetails?.role,
  userId: state.profile.userDetails?.userMgntUserID
})

const mapDispatchToProps = (dispatch: Dispatch): IDispatchProps => ({
  downloadDeclaration: (
    event: Event,
    compositionId: string,
    action: string,
    client: ApolloClient<any>
  ) => dispatch(downloadDeclaration(event, compositionId, action, client)),
  unassignDeclaration: (id: string, client: ApolloClient<any>) =>
    dispatch(unassignDeclaration(id, client))
})

export const DownloadButton = connect(
  mapStateToProps,
  mapDispatchToProps
)(withApollo(withOnlineStatus(DownloadButtonComponent)))
