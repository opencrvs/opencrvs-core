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
import { Meta, Story } from '@storybook/react'
import { AudioRecorder } from './AudioRecorder'
import { ResponsiveModal } from '../../interface'
import { TertiaryButton, PrimaryButton } from '../../buttons'

export default {
  title: 'Components/forms/AudioRecorder',
  component: AudioRecorder
} as Meta

const Template: Story<any> = (args) => {
  const [isAudioRecorderModalOpen, setIsAudioRecorderModalOpen] =
    useState(false)

  return (
    <>
      <AudioRecorder.Button onClick={() => setIsAudioRecorderModalOpen(true)}>
        Record
      </AudioRecorder.Button>

      <ResponsiveModal
        title="Audio signature of informant"
        autoHeight={true}
        titleHeightAuto={true}
        width={600}
        show={isAudioRecorderModalOpen}
        actions={[
          <TertiaryButton
            key="cancel"
            onClick={() => setIsAudioRecorderModalOpen(false)}
          >
            Cancel
          </TertiaryButton>,
          <PrimaryButton
            key="apply"
            disabled={false}
            onClick={() => alert('applied')}
          >
            Apply
          </PrimaryButton>
        ]}
        handleClose={() => setIsAudioRecorderModalOpen(false)}
      >
        <AudioRecorder />
      </ResponsiveModal>
    </>
  )
}
export const AudioRecorderView = Template.bind({})
