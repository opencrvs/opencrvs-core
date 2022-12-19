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

type AudioRecorderProps = {
  id?: string
  onRecorded?: () => void
  onClose?: () => void
}

export const AudioRecorder = ({ id }: AudioRecorderProps) => {
  return <b>moi</b>
}

const Button = ({
  children,
  onClick
}: {
  children: string
  onClick: () => void
}) => (
  <SecondaryButton onClick={onClick}>
    <Mic />
    &nbsp;&nbsp;{children}
  </SecondaryButton>
)

AudioRecorder.Button = Button
