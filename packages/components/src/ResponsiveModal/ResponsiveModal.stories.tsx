/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { ComponentStory, Meta } from '@storybook/react'
import { Button } from '../Button'
import { ResponsiveModal } from './ResponsiveModal'
import React, { useState } from 'react'

const Template: ComponentStory<typeof ResponsiveModal> = (args) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <>
      <Button type="primary" onClick={() => setIsVisible(true)}>
        Open dialog
      </Button>

      <ResponsiveModal
        {...args}
        show={isVisible}
        handleClose={() => setIsVisible(false)}
      >
        Children elements will go here
      </ResponsiveModal>
    </>
  )
}

export const ResponsiveModalView = Template.bind({})
ResponsiveModalView.args = {
  title: 'Are you ready to submit?',
  actions: [
    <Button type="primary" onClick={() => alert('Submit button clicked')}>
      Submit
    </Button>,
    <Button type="secondary" onClick={() => alert('Preview Button clicked')}>
      Preview
    </Button>
  ]
}

export default {
  title: 'Deprecated/ResponsiveModal',
  component: ResponsiveModal,
  parameters: {
    docs: {
      description: {
        component: `<b>Note! Deprecated in favor of Dialog component.</b>

\`<ResponsiveModal>\` is a modal component which requests an action from a user.`
      }
    }
  }
} as Meta
