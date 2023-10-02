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
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getLanguage } from '@client/i18n/selectors'
import { getIndividualNameObj } from '@client/utils/userUtils'
import { Avatar } from '@client/components/Avatar'
import { ExpandingMenu } from '@opencrvs/components/lib/ExpandingMenu'
import { FixedNavigation } from '@client/components/interface/Navigation'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { getUserRole } from '@client/views/SysAdmin/Config/UserRoles/utils'
import { Role } from '@client/utils/gateway'

export function Hamburger() {
  const [showMenu, setShowMenu] = useState(false)
  const userDetails = useSelector(getUserDetails)
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

  // let's remove this type assertion after #4458 merges in
  const role =
    (userDetails?.role && getUserRole(language, userDetails.role as Role)) ?? ''

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
