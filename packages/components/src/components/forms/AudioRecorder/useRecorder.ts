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
import { useReducer } from 'react'
import { useInterval } from './useInterval'

type State = {
  isRecording: boolean
  recorder: MediaRecorder | null
  data: Blob | null
  error: Error | null
  secondsPassed: number | null
}

type Actions =
  | { type: 'START' }
  | { type: 'START_RECORDING'; payload: { recorder: MediaRecorder } }
  | { type: 'CANCEL' }
  | { type: 'STOP' }
  | { type: 'UPDATE_SECONDS'; payload: { secondsPassed: number | null } }
  | { type: 'HAS_ERROR'; payload: { error: Error | null } }

const initState: State = {
  isRecording: false,
  recorder: null,
  data: null,
  error: null,
  secondsPassed: null
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result?.toString())
    reader.readAsDataURL(blob)
  })
}

const reducer = (state: State, action: Actions): State => {
  switch (action.type) {
    case 'START':
      return { ...state, isRecording: true }
    case 'STOP':
      return { ...state, isRecording: false }
    case 'CANCEL':
      return initState
    case 'START_RECORDING':
      return {
        ...state,
        isRecording: true,
        secondsPassed: 0,
        recorder: action.payload.recorder
      }
    case 'UPDATE_SECONDS':
      return { ...state, secondsPassed: action.payload.secondsPassed }
    case 'HAS_ERROR':
      return { ...state, isRecording: false, error: action.payload.error }
    default:
      return state
  }
}

export type Base64String = string

export const useRecorder = (
  cb: (result: Base64String) => void,
  MAX_SECONDS_PASSED = 20
) => {
  const [state, dispatch] = useReducer(reducer, initState)

  const finishRecording = async ({ data }: { data: Blob }) => {
    const base64String = await blobToBase64(data)
    cb(base64String)
  }

  const updateSeconds = () => {
    if (!state.isRecording) return

    if ((state.secondsPassed ?? 0) >= MAX_SECONDS_PASSED - 1) {
      stop()
    }

    dispatch({
      type: 'UPDATE_SECONDS',
      payload: { secondsPassed: (state.secondsPassed ?? 0) + 1 }
    })
  }

  useInterval(updateSeconds, state.isRecording ? 1000 : null)

  const start = async () => {
    try {
      if (state.isRecording) return
      dispatch({ type: 'START' })
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      dispatch({ type: 'START_RECORDING', payload: { recorder } })
      recorder.start()
      recorder.addEventListener('dataavailable', finishRecording)
      if (state.error) dispatch({ type: 'HAS_ERROR', payload: { error: null } })
    } catch (err) {
      dispatch({ type: 'HAS_ERROR', payload: { error: err } })
    }
  }

  const stop = () => {
    try {
      const recorder = state.recorder
      dispatch({ type: 'STOP' })
      if (recorder) {
        if (recorder.state !== 'inactive') {
          recorder.stop()
          recorder.stream.getTracks().forEach((track) => track.stop())
        }
        recorder.removeEventListener('dataavailable', finishRecording)
      }
    } catch (err) {
      dispatch({ type: 'HAS_ERROR', payload: { error: err } })
    }
  }

  const cancel = () => dispatch({ type: 'CANCEL' })

  return {
    start,
    stop,
    cancel,
    recorder: state.recorder,
    isRecording: state.isRecording,
    error: state.error,
    secondsPassed: state.secondsPassed
  }
}
