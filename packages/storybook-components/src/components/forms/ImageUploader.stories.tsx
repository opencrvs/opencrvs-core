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
import { Meta, Story } from '@storybook/react'
import { ArrowForward } from '../icons'
import { ImageUploader, IImagePickerProps } from './ImageUploader'

export default {
  title: 'Components/forms/ImageUploader',
  component: ImageUploader
} as Meta

const Template: Story<IImagePickerProps> = args => <ImageUploader {...args} />

export const Image = Template.bind({})
Image.args = {
  title: 'Upload',
  icon: () => <ArrowForward />,
  handleFileChange: () => {
    alert('Uploaded!')
  }
}
