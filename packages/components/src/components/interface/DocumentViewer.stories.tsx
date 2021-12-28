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
import { DocumentViewer, IDocumentViewerOptions } from './DocumentViewer'
import React from 'react'

interface IProps {
  id?: string
  options: IDocumentViewerOptions
}

const Template: Story<IProps> = (args) => <DocumentViewer {...args} />
export const DocumentView = Template.bind({})
DocumentView.args = {
  options: {
    selectOptions: [
      {
        value: 'https://picsum.photos/1920/1080?random',
        label: 'National ID'
      },
      {
        value: 'https://picsum.photos/768/1024?random',
        label: 'Passport'
      }
    ],
    documentOptions: [
      {
        value: 'https://picsum.photos/768/1024?random',
        label: 'Passport'
      }
    ]
  },
  id: 'Document View'
}

export default {
  title: 'Components/Interface/DocumentViewer',
  component: DocumentViewer
} as Meta
