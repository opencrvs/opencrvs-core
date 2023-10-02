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
import React from 'react'
import { ListUser } from './index'
import { Link } from '../Link'
import { Text } from '../Text'
import { Pill } from '../Pill'
import { ToggleMenu } from '../ToggleMenu'
import { Icon } from '../Icon'
import { AvatarSmall } from '../icons'

export default {
  title: 'Data/List User',
  component: ListUser
}

const StatusPill = <Pill label="Active" type="active" size="small" />

const UserMenu = (
  <ToggleMenu
    id="birth"
    menuItems={[
      {
        handler: () => {},
        icon: <Icon name="Pencil" size="medium" weight="bold" />,
        label: 'Edit'
      },
      {
        handler: function noRefCheck() {},
        icon: <Icon name="X" size="medium" weight="bold" />,
        label: 'Deactivate'
      }
    ]}
    toggleButton={<Icon name="DotsThreeVertical" size="medium" weight="fill" />}
  />
)

export const Default = () => (
  <div>
    <ListUser
      labelHeader="NAME"
      valueHeader="ROLE"
      rows={[
        {
          avatar: <AvatarSmall />,
          label: (
            <Link element="button" font="bold16">
              Michael Jones
            </Link>
          ),
          value: (
            <Text element="p" variant="reg16">
              Registration Agent
            </Text>
          ),
          status: [StatusPill],
          actions: [UserMenu]
        },
        {
          avatar: <AvatarSmall />,
          label: (
            <Link element="button" font="bold16">
              Michael Jones
            </Link>
          ),
          value: (
            <Text element="p" variant="reg16">
              Registrar
            </Text>
          ),
          status: [StatusPill],
          actions: [UserMenu]
        },
        {
          avatar: <AvatarSmall />,
          label: (
            <Link element="button" font="bold16">
              Craig David
            </Link>
          ),
          value: (
            <Text element="p" variant="reg16">
              Field Agent
            </Text>
          ),
          status: [StatusPill],
          actions: [UserMenu]
        }
      ]}
    />
  </div>
)
