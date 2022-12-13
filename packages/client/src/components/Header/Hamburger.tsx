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
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getLanguage } from '@client/i18n/selectors'
import { getIndividualNameObj } from '@client/utils/userUtils'
import { userMessages } from '@client/i18n/messages'
import { Avatar } from '@client/components/Avatar'
import { ExpandingMenu } from '@opencrvs/components/lib/ExpandingMenu'
import { FixedNavigation } from '@client/components/interface/Navigation'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'

export function Hamburger() {
  const [showMenu, setShowMenu] = useState(false)
  const userDetails = useSelector(getUserDetails)
  const intl = useIntl()
  const language = useSelector(getLanguage)
  const toggleMenu = () => {
    setShowMenu((prevState) => !prevState)
  }
  let name = ''
  if (userDetails && userDetails.name) {
    const nameObj = getIndividualNameObj(userDetails.name, language)
    name = nameObj
      ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
      : ''
  }

  const role =
    userDetails && userDetails.role
      ? intl.formatMessage(userMessages[userDetails.role])
      : ''

  const avatar = <Avatar name={name} avatar={userDetails?.avatar} />

  const userInfo = { name, role, avatar }

  return (
    <>
      <Button
        type="icon"
        size="medium"
        aria-label="Open menu"
        onClick={toggleMenu}
      >
        <Icon color="currentColor" name="Menu" size="large"></Icon>
      </Button>
      <ExpandingMenu
        showMenu={showMenu}
        menuCollapse={() => toggleMenu()}
        navigation={() => (
          <FixedNavigation
            navigationWidth={320}
            menuCollapse={() => toggleMenu()}
            userInfo={userInfo}
          />
        )}
      />
    </>
  )
}
