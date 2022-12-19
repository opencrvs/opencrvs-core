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
import { SetRecorder } from './types'

export async function startRecording(setRecorderState: SetRecorder) {
  try {
    const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    setRecorderState((prevState) => {
      return {
        ...prevState,
        initRecording: true,
        mediaStream: stream
      }
    })
  } catch (err) {
    console.log(err)
  }
}

export function saveRecording(recorder: any) {
  if (recorder.state !== 'inactive') recorder.stop()
}
