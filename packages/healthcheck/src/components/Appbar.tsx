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

'use client'
import React, { useState } from 'react'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Text } from '@opencrvs/components/lib/Text'
import { Button } from '@opencrvs/components/lib/Button'
import { Stack } from '@opencrvs/components/lib/Stack'
import { ToggleMenu } from '@opencrvs/components/lib/ToggleMenu'
import {
  BackArrow,
  Hamburger,
  SearchBlue,
  Notification,
  HelpBlue,
  LogoutBlack,
  SettingsBlack,
  VerticalThreeDots
} from '@opencrvs/components/lib/icons'
import styled from 'styled-components'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'

export default function Appbar() {
  const [showModal, setShowModal] = useState(true)

  function handleClose() {
    setShowModal(false)
  }
  return (
    <AppBar
      desktopCenter={
        <Text variant="h4" element="span">
          {' '}
          Health and Performance
        </Text>
      }
      desktopRight={
        <Stack gap={4}>
          <Button aria-label="Go back" size="medium" type="icon">
            <HelpBlue />
          </Button>
          <Button aria-label="Go back" size="medium" type="icon">
            <Notification />
          </Button>
          {/* <ResponsiveModal
            actions={[
              <Button
                size="small"
                onClick={function noRefCheck() {}}
                type="primary"
              >
                Submit
              </Button>,
              <Button
                size="small"
                onClick={function noRefCheck() {}}
                type="secondary"
              >
                Preview
              </Button>
            ]}
            handleClose={handleClose}
            title="Notification"
            show={showModal}
            width={300}
            contentHeight={400}
          /> */}
          {/* <div
            style={{
              height: '200px',
              position: 'relative',
              width: '300px'
            }}
          > */}
          {/* <ToggleMenu
            key="toggleMenu"
            id="toggleMenu"
            menuItems={[{ handler: function noRefCheck() {}, label: 'Item 1' }]}
            toggleButton={<VerticalThreeDots />}
          /> */}
          {/* </div> */}
        </Stack>
      }
      //   mobileLeft={
      //     <Button aria-label="Go back" type="icon">
      //       <Hamburger />
      //     </Button>
      //   }
      //   mobileRight={<SearchBlue />}
      //   mobileTitle="Search"
    />
  )
}
