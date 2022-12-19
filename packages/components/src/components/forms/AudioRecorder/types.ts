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
import { Dispatch, SetStateAction } from 'react'

export type Recorder = {
  recordingMinutes: number
  recordingSeconds: number
  initRecording: boolean
  mediaStream: MediaStream | null
  mediaRecorder: MediaRecorder | null
  audio: string | null
}

export type UseRecorder = {
  recorderState: Recorder
  startRecording: () => void
  cancelRecording: () => void
  saveRecording: () => void
}

export type RecorderControlsProps = {
  recorderState: Recorder
  handlers: {
    startRecording: () => void
    cancelRecording: () => void
    saveRecording: () => void
  }
}

export type RecordingsListProps = {
  audio: string | null
}

export type Audio = {
  key: string
  audio: string
}

export type Interval = null | number | ReturnType<typeof setInterval>
export type SetRecorder = Dispatch<SetStateAction<Recorder>>
export type SetRecordings = Dispatch<SetStateAction<Audio[]>>
export type AudioTrack = MediaStreamTrack
export type MediaRecorderEvent = {
  data: Blob
}
