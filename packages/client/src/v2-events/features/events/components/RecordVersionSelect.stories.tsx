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
import { RecordVersionSelect } from './RecordVersionSelect'

function version(
  id: string,
  form: RecordForm,
  indexInForm: number,
  isLatestOfForm: boolean
): RecordVersion {
  return {
    actionId: id as UUID,
    actionType: ActionType.DECLARE,
    form,
    indexInForm,
    isLatestOfForm,
    createdAt: '2026-05-08T10:00:00.000Z',
    createdBy: 'user-1'
  }
}

const meta: Meta<typeof RecordVersionSelect> = {
  title: 'Events/RecordVersionSelect',
  component: RecordVersionSelect
}

export default meta

type Story = StoryObj<typeof RecordVersionSelect>

const oneEach = [
  version('a', RecordForm.NOTIFICATION, 0, true),
  version('b', RecordForm.DECLARATION, 0, true),
  version('c', RecordForm.REGISTRATION, 0, true)
]

export const OneVersionPerForm: Story = {
  args: {
    versions: oneEach,
    selected: oneEach[2],
    onSelect: () => undefined
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByTestId('record-version-select')).toHaveTextContent(
      'Registration • Only version'
    )
  }
}

const withCorrections = [
  version('a', RecordForm.DECLARATION, 0, true),
  version('b', RecordForm.REGISTRATION, 0, false),
  version('c', RecordForm.REGISTRATION, 1, false),
  version('d', RecordForm.REGISTRATION, 2, true)
]

export const RegistrationCorrectedTwice: Story = {
  args: {
    versions: withCorrections,
    selected: withCorrections[3],
    onSelect: () => undefined
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByTestId('record-version-select')).toHaveTextContent(
      'Registration • Latest'
    )

    await userEvent.click(canvas.getByTestId('record-version-select'))

    // Newest first, and the declaration reads "Only version" because it has one.
    await expect(
      canvas.getByTestId('record-version-option-b')
    ).toHaveTextContent('Registration • Original')
    await expect(
      canvas.getByTestId('record-version-option-c')
    ).toHaveTextContent('Registration • Version 2')
    await expect(
      canvas.getByTestId('record-version-option-a')
    ).toHaveTextContent('Declaration • Only version')
  }
}

export const AnEarlierVersionSelected: Story = {
  args: {
    versions: withCorrections,
    selected: withCorrections[1],
    onSelect: () => undefined
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByTestId('record-version-select')).toHaveTextContent(
      'Registration • Original'
    )
  }
}
