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
import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from 'storybook/test'
import {
  ActionType,
  RecordForm,
  RecordVersion,
  UUID
} from '@opencrvs/commons/client'
import { RecordVersionMenu } from './RecordVersionMenu'

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

/** Notification, declaration and registration, with the registration corrected twice. */
const corrected: RecordVersion[] = [
  version(
    'n1',
    RecordForm.NOTIFICATION,
    ActionType.NOTIFY,
    0,
    true,
    '2026-05-02T09:00:00.000Z'
  ),
  version(
    'd1',
    RecordForm.DECLARATION,
    ActionType.DECLARE,
    0,
    true,
    '2026-05-05T09:00:00.000Z'
  ),
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

/** The common record: one version of each form. */
const oneEach: RecordVersion[] = [
  version(
    'n1',
    RecordForm.NOTIFICATION,
    ActionType.NOTIFY,
    0,
    true,
    '2026-05-02T09:00:00.000Z'
  ),
  version(
    'd1',
    RecordForm.DECLARATION,
    ActionType.DECLARE,
    0,
    true,
    '2026-05-08T09:00:00.000Z'
  ),
  version(
    'r1',
    RecordForm.REGISTRATION,
    ActionType.REGISTER,
    0,
    true,
    '2026-05-10T09:00:00.000Z'
  )
]

const meta: Meta<typeof RecordVersionMenu> = {
  title: 'Events/RecordVersionMenu',
  component: RecordVersionMenu
}

export default meta

type Story = StoryObj<typeof RecordVersionMenu>

export const RegistrationWithThreeVersions: Story = {
  args: {
    versions: corrected,
    selected: corrected[4],
    onSelect: () => undefined
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByTestId('record-version-select'))
    await expect(
      await canvas.findByTestId('record-version-option-r3')
    ).toHaveTextContent('Latest')
    await expect(
      canvas.getByTestId('record-version-option-r2')
    ).toHaveTextContent('After correction 1')
    await expect(
      canvas.getByTestId('record-version-option-r1')
    ).toHaveTextContent('As first registered')
  }
}

/** The check moves to the selected row. */
export const AnEarlierVersionSelected: Story = {
  args: {
    versions: corrected,
    selected: corrected[2],
    onSelect: () => undefined
  }
}

/** Single-version forms are plain rows. */
export const OneVersionPerForm: Story = {
  args: {
    versions: oneEach,
    selected: oneEach[2],
    onSelect: () => undefined
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByTestId('record-version-select'))
    // No form expands, because none has more than one version.
    await expect(
      await canvas.findByTestId('record-version-form-REGISTRATION')
    ).toBeInTheDocument()
    await expect(
      canvas.queryByTestId('record-version-option-r1')
    ).not.toBeInTheDocument()
  }
}

/** The menu lists only the forms that exist. */
export const NoNotification: Story = {
  args: {
    versions: corrected.filter((v) => v.form !== RecordForm.NOTIFICATION),
    selected: corrected[4],
    onSelect: () => undefined
  }
}
