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
import React, { useState } from 'react'
import { useRecorder } from './useRecorder'
import { SecondaryButton, TertiaryButton, PrimaryButton } from '../../buttons'
import { Mic } from '../../icons/Mic'
import { ResponsiveModal } from '../../interface'
import styled, { keyframes } from 'styled-components'
import { Recorder } from './types'

const pulsingAnimation = keyframes`
0% {
  transform: scale(0.95)
}
50% {
  transform: scale(1)
}
100% {
  transform: scale(0.95);
}
`

const PulsingSVG = styled.svg`
  width: min(100%, 80px);
  height: min(100%, 80px);
  aspect-ratio: 1/1;
  animation: ${pulsingAnimation} 1s ease-in-out infinite;
  background: ${({ theme }) => theme.colors.grey200};
  color: ${({ theme }) => theme.colors.grey400};
  border-radius: 50%;
  padding: 16px;
`

const TextAlignCentered = styled.span`
  text-align: center;
`

interface AudioRecorderProps {
  children: string
  onRecordEnd: (state: Recorder) => void
}

export const AudioRecorder = ({
  children,
  onRecordEnd
}: AudioRecorderProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { startRecording, saveRecording, cancelRecording } = useRecorder({
    onRecordEnd
  })

  const onStartRecording = async () => {
    await startRecording()
    setDialogOpen(true)
  }

  const onCancelRecording = async () => {
    setDialogOpen(false)
    cancelRecording()
  }

  const onSaveRecording = async () => {
    saveRecording()
    setDialogOpen(false)
  }

  return (
    <>
      <SecondaryButton onClick={onStartRecording}>
        <Mic />
        &nbsp;&nbsp;{children}
      </SecondaryButton>

      <ResponsiveModal
        id="audio-recorder-modal"
        title="Speak now"
        autoHeight={true}
        titleHeightAuto={true}
        width={600}
        show={dialogOpen}
        actions={[
          <TertiaryButton
            key="cancel"
            id="modal_cancel"
            onClick={onCancelRecording}
          >
            Cancel
          </TertiaryButton>,
          <PrimaryButton
            key="apply"
            id="apply_change"
            disabled={false}
            onClick={onSaveRecording}
          >
            Apply
          </PrimaryButton>
        ]}
        handleClose={onCancelRecording}
      >
        <TextAlignCentered>
          <PulsingSVG
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </PulsingSVG>
        </TextAlignCentered>
      </ResponsiveModal>
    </>
  )
}
