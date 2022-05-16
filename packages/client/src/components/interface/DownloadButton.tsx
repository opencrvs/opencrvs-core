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
  makeDeclarationReadyToDownload,
  DOWNLOAD_STATUS
} from '@client/declarations'
import { Event, Action } from '@client/forms'
import { withApollo, WithApolloClient } from 'react-apollo'
import { Downloaded } from '@opencrvs/components/lib/icons/Downloaded'
import { GQLAssignmentData } from '@opencrvs/gateway/src/graphql/schema'
import { IStoreState } from '@client/store'

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
}
interface IDispatchProps {
  downloadDeclaration: typeof downloadDeclaration
}

type HOCProps = IConnectProps & IDispatchProps & WithApolloClient<{}>

const ModalContainer = styled.div`
  max-height: 720px;
`
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
    onUnAssign: () => void
    onHideModal: () => void
  },
  userRole?: string
): AssignModalOptions {
  if (assignment) {
    return {
      title: 'Assigned record',
      content: `${[assignment.firstName, assignment.lastName].join(' ')} at ${
        assignment.officeName
      } has sole editable access to this record`,
      actions: []
    }
  }
  return {
    title: 'Assign record?',
    content:
      'Please note you will have sole access to this record. Please make any updates promptly otherwise unassign the record.',
    actions: [
      {
        label: 'Cancel',
        type: 'tertiary',
        handler: callbacks.onHideModal
      },
      {
        label: 'Assign',
        type: 'success',
        handler: callbacks.onAssign
      }
    ]
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
    userRole
  } = props
  const { assignment } = downloadConfigs
  const [assignModal, setAssignModal] = useState<AssignModalOptions | null>(
    null
  )
  const initiateDownload = useCallback(() => {
    const { event, compositionId, action } = downloadConfigs
    const downloadableDeclaration = makeDeclarationReadyToDownload(
      event.toLowerCase() as unknown as Event,
      compositionId,
      action
    )

    downloadDeclaration(downloadableDeclaration, client)
  }, [downloadConfigs, client, downloadDeclaration])

  const onClickDownload = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setAssignModal(
        getAssignModalOptions(
          assignment,
          {
            onAssign: initiateDownload,
            onUnAssign: () => console.log('To be implemented'),
            onHideModal: () => setAssignModal(null)
          },
          userRole
        )
      )
      e.stopPropagation()
    },
    [assignment, userRole, initiateDownload]
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

  if (
    status === DOWNLOAD_STATUS.FAILED ||
    status === DOWNLOAD_STATUS.FAILED_NETWORK
  ) {
    return (
      <StatusIndicator className={className} id={`${id}-download-failed`}>
        <DownloadAction
          id={`${id}-icon`}
          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            initiateDownload()
            e.stopPropagation()
          }}
        >
          <Download isFailed={true} />
        </DownloadAction>
      </StatusIndicator>
    )
  }

  if (status === DOWNLOAD_STATUS.DOWNLOADED) {
    return (
      <StatusIndicator>
        <Downloaded />
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
        <Download />
      </DownloadAction>
      {assignModal !== null && (
        <ResponsiveModal
          show
          title={assignModal.title}
          actions={assignModal.actions.map(renderModalAction)}
          autoHeight
          responsive={false}
          preventClickOnParent
          handleClose={() => {
            setAssignModal(null)
          }}
        >
          {assignModal.content}
        </ResponsiveModal>
      )}
    </>
  )
}

const mapStateToProps = (state: IStoreState): IConnectProps => ({
  userRole: state.profile.userDetails?.role
})
export const DownloadButton = connect(mapStateToProps, { downloadDeclaration })(
  withApollo(DownloadButtonComponent)
)
