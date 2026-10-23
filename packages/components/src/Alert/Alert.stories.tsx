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

import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert } from './Alert'

const meta: Meta<typeof Alert> = {
  title: 'Data/Alert',
  component: Alert,
  parameters: {
    docs: {
      description: {
        component:
          'Alert states a condition that persists — something true about the ' +
          'record or the screen for as long as it is open. Use Toast instead ' +
          'to confirm an action the user just took.'
      }
    }
  },
  argTypes: {
    type: { control: 'radio', options: ['info', 'success', 'warning', 'error'] }
  },
  /*
   * The actions addon injects a handler into every `on*` prop, which would
   * otherwise give every story a close button and an unlabelled action.
   * Stories that want either opt in.
   */
  args: {
    onClose: undefined,
    onActionClick: undefined
  }
}

export default meta

type Story = StoryObj<typeof Alert>

/**
 * The title states the situation; the message says what follows from it. A
 * title alone is enough when there is nothing to add.
 */
export const Info: Story = {
  args: {
    type: 'info',
    title: 'Registration — You are viewing the latest version',
    children:
      'Corrected by Kennedy Mweene on 20 May 2026. First registered on 10 May 2026, and corrected twice since.'
  }
}

/** Something is true that the user should weigh before acting. */
export const Warning: Story = {
  args: {
    type: 'warning',
    title: 'Registration — You are viewing an earlier version',
    children:
      'Corrected by Kennedy Mweene on 14 May 2026. This is not the current registration.'
  }
}

/** Something is wrong, or a record is no longer valid. */
export const Error: Story = {
  args: {
    type: 'error',
    title: 'This record has been archived',
    children:
      'Archived by Kennedy Mweene on 12 May 2026. No action can be taken on it until it is reinstated.'
  }
}

/** An outcome worth confirming that persists on the screen. */
export const Success: Story = {
  args: {
    type: 'success',
    title: 'The correction was approved',
    children:
      'Approved by Jonathan Campbell on 3 June 2026. The changes are now part of the registration.'
  }
}

/**
 * An action opens whatever needs a decision. It sits under the message so a
 * long message keeps the full width and a long label is not squeezed.
 */
export const WithAction: Story = {
  args: {
    type: 'warning',
    title: 'A correction to this registration is awaiting approval',
    children:
      'Requested by Felix Katongo on 22 May 2026. The requested changes are not part of the registration until they are approved.',
    actionText: 'Review the correction request',
    onActionClick: () => undefined
  }
}

/** Dismissable where the alert is advice rather than a standing condition. */
export const Dismissable: Story = {
  args: {
    type: 'info',
    title: 'This record may be a duplicate',
    children:
      'Flagged on 8 May 2026 against two other records. It cannot be registered until the flag is resolved.',
    onClose: () => undefined
  }
}

/** A title on its own, where the message would only repeat it. */
export const TitleOnly: Story = {
  args: {
    type: 'info',
    title: 'Notification — This is the only version'
  }
}

/** Every type together, to compare weight and contrast at a glance. */
export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert title="Information" type="info">
        The registration is the legal record of the event.
      </Alert>
      <Alert title="Success" type="success">
        The correction was approved and applied to the registration.
      </Alert>
      <Alert title="Warning" type="warning">
        This is not the current version of the registration.
      </Alert>
      <Alert title="Error" type="error">
        This record has been archived and cannot be acted on.
      </Alert>
    </div>
  )
}
