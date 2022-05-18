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
  deleteDeclaration,
  IDeclaration,
  updateRegistrarWorkqueue
} from '@client/declarations'
import { Event, Action } from '@client/forms'
import { withApollo, WithApolloClient } from 'react-apollo'
import { Downloaded } from '@opencrvs/components/lib/icons/Downloaded'
import { GQLAssignmentData } from '@opencrvs/gateway/src/graphql/schema'
import { IStoreState } from '@client/store'
import { AvatarVerySmall } from '@client/components/Avatar'
import { ROLE_LOCAL_REGISTRAR } from '@client/utils/constants'
import { MARK_EVENT_UNASSIGNED } from '@client/views/DataProvider/birth/mutations'
import { Dispatch } from 'redux'
import ApolloClient from 'apollo-client'

const { useState, useCallback } = React
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
  deleteDeclaration: typeof deleteDeclaration
  syncWorkqueue: typeof updateRegistrarWorkqueue
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
interface IModalAction extends IActionObject {
  type: 'success' | 'danger' | 'tertiary'
}
interface AssignModalOptions {
  title: string
  actions: IModalAction[]
  content: string
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
      title: 'Unassign record?',
      content:
        'Unassigning this record will mean that any current edits will be lost. Please confirm you wish to continue.',
      actions: [
        { label: 'Cancel', type: 'tertiary', handler: callbacks.onCancel },
        { label: 'Unassign', type: 'danger', handler: callbacks.onUnassign }
      ]
    }
  } else if (assignment) {
    if (userRole === ROLE_LOCAL_REGISTRAR) {
      return {
        title: 'Unassign record?',
        content: `${[assignment.firstName, assignment.lastName].join(' ')} at ${
          assignment.officeName
        } currently has sole editable access to this record. Unassigning this record will mean their current edits will be lost. Please confirm you wish to continue.`,
        actions: [
          { label: 'Cancel', type: 'tertiary', handler: callbacks.onCancel },
          { label: 'Unassign', type: 'danger', handler: callbacks.onUnassign }
        ]
      }
    }
    return {
      title: 'Assigned record',
      content: `${[assignment.firstName, assignment.lastName].join(' ')} at ${
        assignment.officeName
      } has sole editable access to this record`,
      actions: []
    }
  } else {
    return {
      title: 'Assign record?',
      content:
        'Please note you will have sole access to this record. Please make any updates promptly otherwise unassign the record.',
      actions: [
        {
          label: 'Cancel',
          type: 'tertiary',
          handler: callbacks.onCancel
        },
        {
          label: 'Assign',
          type: 'success',
          handler: callbacks.onAssign
        }
      ]
    }
  }
}

function renderModalAction(action: IModalAction): JSX.Element {
  let Button
  if (action.type === 'success') {
    Button = SuccessButton
  } else if (action.type === 'danger') {
    Button = DangerButton
  } else {
    Button = TertiaryButton
  }
  return <Button onClick={action.handler}>{action.label}</Button>
}

function DownloadButtonComponent(props: DownloadButtonProps & HOCProps) {
  const {
    id,
    status,
    className,
    downloadConfigs,
    client,
    downloadDeclaration,
    userRole,
    userId,
    deleteDeclaration,
    syncWorkqueue
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
    await client.mutate({
      mutation: MARK_EVENT_UNASSIGNED,
      variables: { id: compositionId }
    })
  }, [compositionId, client])
  const remove = useCallback(
    () => deleteDeclaration({ id: compositionId as string } as IDeclaration),
    [deleteDeclaration, compositionId]
  )
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
                hideModal()
                await unassign()
                remove()
                syncWorkqueue()
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
    [
      assignment,
      userRole,
      download,
      userId,
      status,
      unassign,
      hideModal,
      syncWorkqueue,
      remove
    ]
  )

  if (
    status === DOWNLOAD_STATUS.READY_TO_DOWNLOAD ||
    status === DOWNLOAD_STATUS.DOWNLOADING
  ) {
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
          title={assignModal.title}
          actions={assignModal.actions.map(renderModalAction)}
          autoHeight
          responsive={false}
          preventClickOnParent
          handleClose={hideModal}
        >
          {assignModal.content}
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
  deleteDeclaration: (declaration: IDeclaration) =>
    dispatch(deleteDeclaration(declaration)),
  syncWorkqueue: () =>
    dispatch(updateRegistrarWorkqueue(10, 0, 0, 0, 0, 0, 0, 0))
})

export const DownloadButton = connect(
  mapStateToProps,
  mapDispatchToProps
)(withApollo(DownloadButtonComponent))
