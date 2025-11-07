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
import React, { useState } from 'react'
import { Button } from '@opencrvs/components/lib/Button'
import { ExpandingMenu } from '@opencrvs/components/lib/ExpandingMenu'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Sidebar } from './Sidebar'

export function Hamburger() {
  const [showMenu, setShowMenu] = useState(false)
  const toggleMenu = () => {
    setShowMenu((prevState) => !prevState)
  }

  return (
    <>
      <Button
        aria-label="Toggle menu"
        size="medium"
        type="icon"
        onClick={toggleMenu}
      >
        <Icon color="primary" name="List" size="medium" />
      </Button>
      <ExpandingMenu
        menuCollapse={toggleMenu}
        navigation={() => (
          <Sidebar
            isMobileView
            menuCollapse={toggleMenu}
            navigationWidth={320}
          />
        )}
        showMenu={showMenu}
      />
    </>
  )
}
