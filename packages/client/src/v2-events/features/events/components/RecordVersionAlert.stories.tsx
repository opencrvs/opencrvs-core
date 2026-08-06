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

import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from 'storybook/test'
import {
  ActionType,
  RecordForm,
  RecordVersion,
  UUID
} from '@opencrvs/commons/client'
import { RecordVersionAlert } from './RecordVersionAlert'

function version(
  id: string,
  form: RecordForm,
  actionType: ActionType,
  indexInForm: number,
  isLatestOfForm: boolean,
  createdAt: string
): RecordVersion {
  return {
    actionId: id as UUID,
    actionType,
    form,
    indexInForm,
    isLatestOfForm,
    createdAt,
    createdBy: 'user-1'
  }
}

const notification = version(
  'n1',
  RecordForm.NOTIFICATION,
  ActionType.NOTIFY,
  0,
  true,
  '2026-05-02T09:00:00.000Z'
)
const declaration = version(
  'd1',
  RecordForm.DECLARATION,
  ActionType.DECLARE,
  0,
  true,
  '2026-05-08T09:00:00.000Z'
)
const registration = version(
  'r1',
  RecordForm.REGISTRATION,
  ActionType.REGISTER,
  0,
  true,
  '2026-05-10T09:00:00.000Z'
)

/** A registration corrected twice: three versions of that form. */
const correctedTwice: RecordVersion[] = [
  declaration,
  version(
    'r1',
    RecordForm.REGISTRATION,
    ActionType.REGISTER,
    0,
    false,
    '2026-05-10T09:00:00.000Z'
  ),
  version(
    'r2',
    RecordForm.REGISTRATION,
    ActionType.APPROVE_CORRECTION,
    1,
    false,
    '2026-05-14T09:00:00.000Z'
  ),
  version(
    'r3',
    RecordForm.REGISTRATION,
    ActionType.APPROVE_CORRECTION,
    2,
    true,
    '2026-05-20T09:00:00.000Z'
  )
]

const meta: Meta<typeof RecordVersionAlert> = {
  title: 'Events/RecordVersionAlert',
  component: RecordVersionAlert
}

export default meta

type Story = StoryObj<typeof RecordVersionAlert>

/** Figma section 11, band A — the newest version of its form reads as info. */
export const RegistrationOnlyVersion: Story = {
  args: {
    versions: [declaration, registration],
    selected: registration
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByTestId('record-version-alert')).toHaveTextContent(
      'Registration — This is the only version'
    )
  }
}

/** The declaration is still the latest declaration, so it is not a warning. */
export const DeclarationOnARegisteredRecord: Story = {
  args: {
    versions: [notification, declaration, registration],
    selected: declaration
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = canvas.getByTestId('record-version-alert')
    await expect(alert).toHaveTextContent(
      'Declaration — This is the only version'
    )
    await expect(alert).toHaveTextContent('The record was registered on')
    await expect(alert).toHaveTextContent(
      'The registration is the legal record of the event.'
    )
  }
}

/** The notification, on a record that has moved on twice. */
export const NotificationOnAProgressedRecord: Story = {
  args: {
    versions: [notification, declaration, registration],
    selected: notification
  }
}

/** Figma section 11, band A — newest of three. */
export const RegistrationLatestOfThree: Story = {
  args: {
    versions: correctedTwice,
    selected: correctedTwice[3]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = canvas.getByTestId('record-version-alert')
    await expect(alert).toHaveTextContent(
      'Registration — You are viewing the latest version'
    )
    await expect(alert).toHaveTextContent('corrected twice since')
  }
}

/** Figma section 11, band B — an older version of its form warns. */
export const RegistrationAsFirstRegistered: Story = {
  args: {
    versions: correctedTwice,
    selected: correctedTwice[1]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByTestId('record-version-alert')).toHaveTextContent(
      'Registration — You are viewing the original version'
    )
  }
}

/** Neither the oldest nor the newest. */
export const RegistrationInBetween: Story = {
  args: {
    versions: correctedTwice,
    selected: correctedTwice[2]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByTestId('record-version-alert')).toHaveTextContent(
      'Registration — You are viewing an earlier version'
    )
  }
}
