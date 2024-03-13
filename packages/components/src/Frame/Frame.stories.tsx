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
import { ComponentMeta } from '@storybook/react'
import React from 'react'
import { EventTopBar } from '../EventTopBar'
import { SideNav } from '../SideNavigation/LeftNavigation.stories'
import { Frame } from './Frame'
import { Content, ContentSize } from '../Content'
import { Box } from '../Box'
import { AppBar } from '../AppBar'

export default {
  title: 'Layout/Frame',
  component: Frame,
  parameters: {
    docs: {
      description: {
        component: `
\`<Frame>\` provides a structure for the application itself, but doesn't add components such as headers, side navigations or main content.
Frame defines a grid and minimal styling.
`
      }
    }
  }
} as ComponentMeta<typeof Frame>

export const PageTemplateContentLarge = () => (
  <Frame
    header={<AppBar title="OpenCRVS" />}
    navigation={<SideNav />}
    skipToContentText="Skip to main content"
  >
    <Content size={ContentSize.LARGE} title="Content title">
      Page content goes here
    </Content>
  </Frame>
)

PageTemplateContentLarge.parameters = {
  layout: 'fullscreen'
}

export const PageTemplateContentMedium = () => (
  <Frame
    header={<AppBar title="OpenCRVS" />}
    navigation={<SideNav />}
    skipToContentText="Skip to main content"
  >
    <Content size={ContentSize.NORMAL} title="Content title">
      Page content goes here
    </Content>
  </Frame>
)

PageTemplateContentMedium.parameters = {
  layout: 'fullscreen'
}

export const PageTemplateFlow = () => (
  <Frame
    header={<AppBar mobileTitle="Page title" desktopTitle="Page title" />}
    skipToContentText="Skip to main content"
  >
    <Content title="Content title ">Page content goes here</Content>
  </Frame>
)

PageTemplateFlow.parameters = { layout: 'fullscreen' }

export const PageTemplateForm = () => (
  <Frame
    header={<EventTopBar title="Hello!" />}
    skipToContentText="Skip to main content"
  >
    <Content title="Content title">Page content goes here</Content>
  </Frame>
)

PageTemplateForm.parameters = { layout: 'fullscreen' }

export const PageTemplateContentSideColumn = () => (
  <Frame
    header={<AppBar title="OpenCRVS" />}
    navigation={<SideNav />}
    skipToContentText="Skip to main content"
  >
    <Frame.Layout>
      <Content title="Content title">Page content goes here</Content>
      <Box>Side content content goes here</Box>
    </Frame.Layout>
  </Frame>
)

PageTemplateContentSideColumn.parameters = { layout: 'fullscreen' }

export const PageTemplateContentMultipleSideColumns = () => (
  <Frame
    header={<AppBar title="OpenCRVS" />}
    navigation={<SideNav />}
    skipToContentText="Skip to main content"
  >
    <Frame.Layout>
      <Frame.Section>
        <Content title="Content title">Page content goes here</Content>
      </Frame.Section>

      <Frame.Section>
        <Box>Side content content goes here</Box>
        <Box>Side content content goes here</Box>
        <Box>Side content content goes here</Box>
      </Frame.Section>
    </Frame.Layout>
  </Frame>
)

PageTemplateContentMultipleSideColumns.parameters = { layout: 'fullscreen' }

export const PageTemplateSequentialContents = () => (
  <Frame
    header={<AppBar title="OpenCRVS" />}
    navigation={<SideNav />}
    skipToContentText="Skip to main content"
  >
    <Content title="Content title">Page content goes here</Content>
    <Content title="Content title">Page content goes here</Content>
  </Frame>
)

PageTemplateSequentialContents.parameters = { layout: 'fullscreen' }

export const PageTemplateSequentialContentsWrapped = () => (
  <Frame
    header={<AppBar title="OpenCRVS" />}
    navigation={<SideNav />}
    skipToContentText="Skip to main content"
  >
    <Frame.Layout>
      <Frame.Section>
        <Content title="Content title">Page content goes here</Content>
        <Content title="Content title">Page content goes here </Content>
      </Frame.Section>
    </Frame.Layout>
  </Frame>
)

PageTemplateSequentialContentsWrapped.parameters = { layout: 'fullscreen' }

export const PageTemplateCentered = () => (
  <Frame
    header={<AppBar title="OpenCRVS" />}
    skipToContentText="Skip to main content"
  >
    <Frame.LayoutCentered>
      <Box>Box content goes here</Box>
    </Frame.LayoutCentered>
  </Frame>
)

PageTemplateCentered.parameters = { layout: 'fullscreen' }
