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
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled from '@client/styledComponents'
import { Spinner } from '@opencrvs/components/lib/interface'
import { Download } from '@opencrvs/components/lib/icons'
import { CircleButton } from '@opencrvs/components/lib/buttons'
import { connect } from 'react-redux'
import {
  downloadDeclaration,
  makeDeclarationReadyToDownload,
  DOWNLOAD_STATUS
} from '@client/declarations'
import { Event, Action } from '@client/forms'
import { withApollo, WithApolloClient } from 'react-apollo'
import { useCallback } from 'react'
import { Downloaded } from '@opencrvs/components/lib/icons/Downloaded'

interface IDownloadConfig {
  event: string
  compositionId: string
  action: Action
}

interface DownloadButtonProps {
  id?: string
  className?: string
  downloadConfigs: IDownloadConfig
  status?: DOWNLOAD_STATUS
}

interface IDispatchProps {
  downloadDeclaration: typeof downloadDeclaration
}

type HOCProps = IDispatchProps & WithApolloClient<{}>

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

function DownloadButtonComponent(props: DownloadButtonProps & HOCProps) {
  const { id, status, className } = props
  const { downloadConfigs, client, downloadDeclaration } = props
  const initiateDownload = useCallback(() => {
    const { event, compositionId, action } = downloadConfigs
    const downloadableDeclaration = makeDeclarationReadyToDownload(
      event.toLowerCase() as unknown as Event,
      compositionId,
      action
    )

    downloadDeclaration(downloadableDeclaration, client)
  }, [downloadConfigs, client, downloadDeclaration])

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
    <DownloadAction
      id={`${id}-icon`}
      onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        initiateDownload()
        e.stopPropagation()
      }}
      className={className}
    >
      <Download />
    </DownloadAction>
  )
}

export const DownloadButton = connect(null, { downloadDeclaration })(
  withApollo(DownloadButtonComponent)
)
