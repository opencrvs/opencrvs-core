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
import { ComponentMeta } from '@storybook/react'
import React from 'react'
import { EventTopBar } from '../interface'
import { LeftNavigation } from '../SideNavigation/LeftNavigation'
import { leftNavigationView } from '../SideNavigation/LeftNavigation.stories'
import { NavigationGroup } from '../SideNavigation/NavigationGroup'
import {
  groupDeclaration,
  groupSetting
} from '../SideNavigation/NavigationGroup.stories'
import { Frame } from './Frame'
import { Content, ContentSize } from '../Content'
import { Box } from '../Box'
import { AppBar } from '../AppBar'

export default {
  title: 'Layout/Frame',
  component: Frame
} as ComponentMeta<typeof Frame>

export const PageTemplateContentLarge = () => (
  <Frame
    header={<AppBar title="OpenCRVS" />}
    navigation={
      <LeftNavigation {...leftNavigationView.args}>
        <NavigationGroup {...groupDeclaration.args} />
        <NavigationGroup {...groupSetting.args} />
      </LeftNavigation>
    }
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
    navigation={
      <LeftNavigation {...leftNavigationView.args}>
        <NavigationGroup {...groupDeclaration.args} />
        <NavigationGroup {...groupSetting.args} />
      </LeftNavigation>
    }
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
  <Frame header={<AppBar mobileTitle="Page title" desktopTitle="Page title" />}>
    <Content title="Content title ">Page content goes here</Content>
  </Frame>
)

PageTemplateFlow.parameters = { layout: 'fullscreen' }

export const PageTemplateForm = () => (
  <Frame header={<EventTopBar title="Hello!" />}>
    <Content title="Content title">Page content goes here</Content>
  </Frame>
)

PageTemplateForm.parameters = { layout: 'fullscreen' }

export const PageTemplateContentSideColumn = () => (
  <Frame
    header={<AppBar title="OpenCRVS" />}
    navigation={
      <LeftNavigation {...leftNavigationView.args}>
        <NavigationGroup {...groupDeclaration.args} />
        <NavigationGroup {...groupSetting.args} />
      </LeftNavigation>
    }
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
    navigation={
      <LeftNavigation {...leftNavigationView.args}>
        <NavigationGroup {...groupDeclaration.args} />
        <NavigationGroup {...groupSetting.args} />
      </LeftNavigation>
    }
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
    navigation={
      <LeftNavigation {...leftNavigationView.args}>
        <NavigationGroup {...groupDeclaration.args} />
        <NavigationGroup {...groupSetting.args} />
      </LeftNavigation>
    }
  >
    <Content title="Content title">Page content goes here</Content>
    <Content title="Content title">Page content goes here</Content>
  </Frame>
)

PageTemplateSequentialContents.parameters = { layout: 'fullscreen' }

export const PageTemplateSequentialContentsWrapped = () => (
  <Frame
    header={<AppBar title="OpenCRVS" />}
    navigation={
      <LeftNavigation {...leftNavigationView.args}>
        <NavigationGroup {...groupDeclaration.args} />
        <NavigationGroup {...groupSetting.args} />
      </LeftNavigation>
    }
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
  <Frame header={<AppBar title="OpenCRVS" />}>
    <Frame.LayoutCentered>
      <Box>Box content goes here</Box>
    </Frame.LayoutCentered>
  </Frame>
)

PageTemplateCentered.parameters = { layout: 'fullscreen' }
