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
import { Meta, StoryFn } from '@storybook/react'
import { toast } from 'react-hot-toast'
import { Toaster, ToastKey } from './Toaster'

const meta: Meta<typeof Toaster> = {
  title: 'Components/Toaster',
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    )
  ]
}

export default meta

export const DefaultToast: StoryFn<typeof Toaster> = () => {
  toast('This is a default toast')

  return <div />
}

export const TranslatedToast: StoryFn<typeof Toaster> = () => {
  toast.error(ToastKey.NOT_ASSIGNED_ERROR)

  return <div />
}

export const SuccessToast: StoryFn<typeof Toaster> = () => {
  toast.success('This is a success toast')

  return <div />
}

export const ErrorToast: StoryFn<typeof Toaster> = () => {
  toast.error('This is an error toast')

  return <div />
}

export const LoadingToast: StoryFn<typeof Toaster> = () => {
  toast.loading('This is a loading toast')

  return <div />
}
