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
import * as React from 'react'
import styled from 'styled-components'
import { Layout, LayoutCentered, LayoutForm } from './components/Layout'
import { Section, SectionFormBackAction } from './components/Section'
import {
  SkipToContent,
  MAIN_CONTENT_ANCHOR_ID
} from './components/SkipToContent'

export interface IFrameProps {
  /** Accepts a header component that will be rendered at the top-most portion of an application frame */
  header: React.ReactNode
  /** Accepts a navigation component that will be rendered in the left sidebar of an application frame */
  navigation?: React.ReactNode
  /** Text inside skip to content -link. Example: "Skip to main content" */
  skipToContentText: string
  /** The content to display inside the frame. */
  children: React.ReactNode
}

const FrameGrid = styled.div`
  display: grid;
  height: 100vh;
  max-height: 100vh;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'navigation header'
    'navigation content';
`

const FrameNavigation = styled.nav`
  grid-area: navigation;
`
const FrameHeader = styled.header`
  grid-area: header;
`
const FrameMainContent = styled.main`
  grid-area: content;
  height: 100%;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.background};
`

export function Frame({
  header,
  navigation,
  skipToContentText,
  children
}: IFrameProps) {
  return (
    <FrameGrid>
      <SkipToContent>{skipToContentText}</SkipToContent>
      <FrameNavigation>{navigation}</FrameNavigation>
      <FrameHeader id="page-title">{header}</FrameHeader>
      <FrameMainContent id={MAIN_CONTENT_ANCHOR_ID}>
        {children}
      </FrameMainContent>
    </FrameGrid>
  )
}

Frame.Layout = Layout
Frame.LayoutForm = LayoutForm
Frame.LayoutCentered = LayoutCentered
Frame.Section = Section
Frame.SectionFormBackAction = SectionFormBackAction
