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
import * as React from 'react'
import styled from 'styled-components'
import { Layout } from './components/Layout'
import { Section } from './components/Section'

export interface IFrameProps {
  /** Accepts a header component that will be rendered at the top-most portion of an application frame */
  header: React.ReactNode
  /** Accepts a navigation component that will be rendered in the left sidebar of an application frame */
  navigation?: React.ReactNode
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

export function Frame({ header, navigation, children }: IFrameProps) {
  return (
    <FrameGrid>
      <FrameNavigation>{navigation}</FrameNavigation>
      <FrameHeader>{header}</FrameHeader>
      <FrameMainContent>{children}</FrameMainContent>
    </FrameGrid>
  )
}

Frame.Layout = Layout
Frame.Section = Section
