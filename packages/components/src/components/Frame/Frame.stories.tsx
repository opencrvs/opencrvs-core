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
import { AppHeader, PageHeader, EventTopBar, Box } from '../interface'
import { LeftNavigation } from '../interface/Navigation/LeftNavigation'
import { leftNavigationView } from '../interface/Navigation/LeftNavigation.stories'
import { NavigationGroup } from '../interface/Navigation/NavigationGroup'
import {
  groupDeclaration,
  groupSetting
} from '../interface/Navigation/NavigationGroup.stories'
import { Frame } from './Frame'
import { Content, ContentSize } from '../interface/Content'

export default {
  title: 'Layout/Frame',
  component: Frame
} as ComponentMeta<typeof Frame>

export const PageTemplateContentLarge = () => (
  <Frame
    header={<AppHeader title="OpenCRVS" />}
    navigation={
      <LeftNavigation {...leftNavigationView.args}>
        <NavigationGroup {...groupDeclaration.args} />
        <NavigationGroup {...groupSetting.args} />
      </LeftNavigation>
    }
  >
    <Content size={ContentSize.LARGE} title="Example title">
      Hi!
    </Content>
  </Frame>
)

PageTemplateContentLarge.parameters = {
  layout: 'fullscreen'
}

export const PageTemplateContentMedium = () => (
  <Frame
    header={<AppHeader title="OpenCRVS" />}
    navigation={
      <LeftNavigation {...leftNavigationView.args}>
        <NavigationGroup {...groupDeclaration.args} />
        <NavigationGroup {...groupSetting.args} />
      </LeftNavigation>
    }
  >
    <Content size={ContentSize.NORMAL} title="Example title">
      Hi!
    </Content>
  </Frame>
)

PageTemplateContentMedium.parameters = {
  layout: 'fullscreen'
}

export const PageTemplateFlow = () => (
  <Frame
    header={
      <PageHeader
        mobileTitle="Hello!"
        desktopTitle="Hello!"
        goBack={() => alert('Go back triggered')}
      />
    }
  >
    <Content title="Example ">Hi!</Content>
  </Frame>
)

PageTemplateFlow.parameters = { layout: 'fullscreen' }

export const PageTemplateForm = () => (
  <Frame header={<EventTopBar title="Hello!" />}>
    <Content title="Example title">Hi!</Content>
  </Frame>
)

PageTemplateForm.parameters = { layout: 'fullscreen' }

export const PageTemplateContentSideColumn = () => (
  <Frame
    header={<AppHeader title="OpenCRVS" />}
    navigation={
      <LeftNavigation {...leftNavigationView.args}>
        <NavigationGroup {...groupDeclaration.args} />
        <NavigationGroup {...groupSetting.args} />
      </LeftNavigation>
    }
  >
    <Frame.Layout>
      <Content title="Example title">This is the main content</Content>
      <Box>This is the sidepanel content</Box>
    </Frame.Layout>
  </Frame>
)

PageTemplateContentSideColumn.parameters = { layout: 'fullscreen' }

export const PageTemplateContentMultipleSideColumns = () => (
  <Frame
    header={<AppHeader title="OpenCRVS" />}
    navigation={
      <LeftNavigation {...leftNavigationView.args}>
        <NavigationGroup {...groupDeclaration.args} />
        <NavigationGroup {...groupSetting.args} />
      </LeftNavigation>
    }
  >
    <Frame.Layout>
      <Frame.Section>
        <Content title="Example title">This is the main content</Content>
      </Frame.Section>

      <Frame.Section>
        <Box>This is the sidepanel content</Box>
        <Box>This is the sidepanel content</Box>
        <Box>This is the sidepanel content</Box>
      </Frame.Section>
    </Frame.Layout>
  </Frame>
)

PageTemplateContentMultipleSideColumns.parameters = { layout: 'fullscreen' }

export const PageTemplateSequentialContents = () => (
  <Frame
    header={<AppHeader title="OpenCRVS" />}
    navigation={
      <LeftNavigation {...leftNavigationView.args}>
        <NavigationGroup {...groupDeclaration.args} />
        <NavigationGroup {...groupSetting.args} />
      </LeftNavigation>
    }
  >
    <Frame.Layout>
      <Frame.Section>
        <Content title="Example title">This is the main content</Content>
        <Content title="Example title">This is the main content</Content>
      </Frame.Section>
    </Frame.Layout>
  </Frame>
)

PageTemplateSequentialContents.parameters = { layout: 'fullscreen' }
