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
import { useSelector } from 'react-redux'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getLanguage } from '@client/i18n/selectors'
import { getIndividualNameObj } from '@client/utils/userUtils'
import { Avatar } from '@client/components/Avatar'
import { FixedNavigation } from '@client/components/interface/Navigation'
import { Button } from '@opencrvs/components/lib/Button'
import { ExpandingMenu } from '@opencrvs/components/lib/ExpandingMenu'
import { Icon } from '@opencrvs/components/lib/Icon'
import { useIntl } from 'react-intl'

export function Hamburger() {
  const [showMenu, setShowMenu] = useState(false)
  const userDetails = useSelector(getUserDetails)
  const language = useSelector(getLanguage)
  const intl = useIntl()
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
    (userDetails?.role && intl.formatMessage(userDetails.role.label)) ?? ''

  const avatar = <Avatar name={name} avatar={userDetails?.avatar} />

  const userInfo = { name, role, avatar }

  return (
    <>
      <Button type="icon" size="medium" onClick={toggleMenu}>
        <Icon name="List" size="medium" color="primary" />
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
