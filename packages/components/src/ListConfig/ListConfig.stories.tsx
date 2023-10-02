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
import { ListConfig } from './index'
import { Icon } from '../Icon'
import { ToggleMenu } from '../ToggleMenu'
import { Toggle } from '../Toggle'
import { Pill } from '../Pill'
import { Button } from '../Button'

export default {
  title: 'Data/List Config',
  component: ListConfig
}

const ConfigMenu = (
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
        label: 'Delete'
      }
    ]}
    toggleButton={<Icon name="DotsThreeVertical" size="medium" weight="fill" />}
  />
)

const EditButton = (
  <Button type="icon" size="medium">
    <Icon name="Pencil" size="medium" weight="bold" />
  </Button>
)
const StatusPill = <Pill label="Active" type="active" size="small" />

const ToggleOption = <Toggle />

export const Default = () => (
  <div>
    <ListConfig
      labelHeader="OPTIONS"
      rows={[
        {
          label: 'Application name',
          labelDescription: 'Choose a name for your application',
          value: 'Farajaland CRV',
          actions: [EditButton]
        },
        {
          label: 'Date format',
          labelDescription:
            'Choose how dates should be displayed throughout the application',
          value: 'DD Month YYYY',
          actions: [EditButton]
        },
        {
          label: 'Name format',
          labelDescription: "Choose how name's should be captured",
          value: 'Firstname(s), Lastname',
          actions: [EditButton]
        },
        {
          label: 'Phone number regex',
          labelDescription: 'Choose how phone numbers should be validated',
          value: '/^0(7|9)[0-9]{1}[0-9]{7}$/',
          actions: [EditButton]
        },
        {
          label: 'Name',
          value: 'Jonathan Pye-Finch',
          actions: [EditButton]
        },
        {
          label: 'Birth certificate',
          labelDescription:
            'Configure your birth certificate template to use digital signatures and not designed to be handwritten',
          value: 'farajaland-birth-vertificate-2023.svg',
          actions: [ConfigMenu]
        },
        {
          label: 'Allow ages in years',
          labelDescription:
            'Informant can provide an age in years if the exact date of birth is unknown',
          value: '\u00A0',
          actions: [ToggleOption]
        },
        {
          label: "Capture informant's signature",
          labelDescription:
            'Configure if a consent with a signature is required from the informant',
          value: 'Disabled',
          actions: [EditButton]
        },
        {
          label: 'January 2023',
          value: '2023-Month-Farajaland-Birth-Statistics.csv',
          actions: [EditButton]
        }
      ]}
    />
  </div>
)
