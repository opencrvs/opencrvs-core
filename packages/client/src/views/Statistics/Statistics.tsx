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
import { useDispatch } from 'react-redux'
import { EventTopBar } from '@opencrvs/components/lib/interface'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/statistics'
import { goToHome } from '@client/navigation'
import IframeResizer from 'iframe-resizer-react'
import styled from '@client/styledComponents'
import { FullBodyContent } from '@opencrvs/components/lib/layout'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import { FullScreen as FullScreenIcon } from '@opencrvs/components/lib/icons'
import { useUserDetails } from '@client/utils/userUtils'
import {
  getDefaultPerformanceLocationId,
  useLocations,
  useOffices
} from '@client/utils/locationUtils'
import { ILocation } from '@client/offline/reducer'
const StyledIFrame = styled(IframeResizer)`
  width: 100%;
  height: 100%;
  border: none;
`
const Container = styled.div`
  width: 100%;
  height: calc(100vh - 56px);
  overflow: auto;
  border: none;
  background: #fff;
  top: 0;
  left: 0;
  position: fixed;
  z-index: 3;
  visibility: ${({ visible }: { visible: boolean }) =>
    visible ? 'visible' : 'hidden'};
  z-index: ${({ visible }: { visible: boolean }) => (visible ? 3 : -1)};
`
function formatStatisticsEmbedUrl(params: Record<string, string>) {
  if (!window.config.STATISTICS_EMBED_URL) {
    return ''
  }

  const configuredUrl = new URL(window.config.STATISTICS_EMBED_URL)
  const searchParams = new URLSearchParams(configuredUrl.search)

  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, value)
  }

  configuredUrl.search = searchParams.toString()

  return configuredUrl.toString()
}

function getParentLocation(
  location: ILocation,
  allLocations: {
    [key: string]: ILocation
  }
) {
  const parentId = location.partOf.replace('Location/', '')
  return allLocations[parentId]
}

function getAllLocationLevels(
  location: ILocation,
  allLocations: {
    [key: string]: ILocation
  }
) {
  if (location.jurisdictionType === 'STATE') {
    return { state: location.name, lga: '', office: '' }
  }

  if (location.jurisdictionType === 'DISTRICT') {
    return {
      state: getParentLocation(location, allLocations).name,
      lga: location.name,
      office: ''
    }
  }

  if (location.type === 'CRVS_OFFICE') {
    const lga = getParentLocation(location, allLocations)
    const state = getParentLocation(lga, allLocations)
    return { state: state.name, lga: lga.name, office: location.name }
  }

  return { state: '', lga: '', office: '' }
}

export function Statistics({ visible }: { visible: boolean }) {
  const intl = useIntl()
  const dispatch = useDispatch()
  const handle = useFullScreenHandle()
  const userDetails = useUserDetails()
  const locations = useLocations()
  const offices = useOffices()

  const defaultView = getDefaultPerformanceLocationId(userDetails!)

  let embedUrl = window.config.STATISTICS_EMBED_URL

  if (defaultView && defaultView !== '0') {
    const allLocations = { ...locations, ...offices }
    const defaultLocation = allLocations[defaultView]

    embedUrl = formatStatisticsEmbedUrl(
      getAllLocationLevels(defaultLocation, allLocations)
    )
  }

  return (
    <Container visible={visible}>
      <EventTopBar
        menuItems={[
          {
            label: 'Full screen',
            icon: <FullScreenIcon />,
            handler: () => handle.enter()
          }
        ]}
        title={intl.formatMessage(messages.headerTitle)}
        pageIcon={<div />}
        goHome={() => dispatch(goToHome())}
      />
      <FullScreen handle={handle}>
        <FullBodyContent>
          {!window.config.STATISTICS_EMBED_URL && (
            <h1>Statistics dashboard URL configuration missing</h1>
          )}
          {window.config.STATISTICS_EMBED_URL && (
            <StyledIFrame src={embedUrl} allowFullScreen />
          )}
        </FullBodyContent>
      </FullScreen>
    </Container>
  )
}
