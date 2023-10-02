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
import { Tab, Tabs } from './components/Tabs'
import { colors } from '../colors'
import { Text } from '../Text'
import { Stack } from '../Stack'

export type ITabColor = keyof typeof colors
export interface IFormTabs<T extends string | number = string> {
  id: T
  title: string
  disabled?: boolean
  icon?: React.ReactNode
  color?: ITabColor
}
export interface IFormTabProps<T extends string | number = string> {
  sections: Array<IFormTabs<T>>
  activeTabId: string
  onTabClick: (tabId: T) => void
}

function FormTabsComponent<T extends string | number = string>({
  sections,
  activeTabId,
  onTabClick
}: IFormTabProps<T>) {
  return (
    <Tabs>
      {sections.map(({ title, id, disabled, icon, color }) => (
        <Tab
          id={`tab_${id}`}
          color={color}
          onClick={() => onTabClick(id)}
          key={id}
          active={activeTabId === id}
          disabled={disabled}
          activeColor={color}
        >
          <Stack>
            {icon}
            <Text variant="bold14" element="span" color={color ?? 'primary'}>
              {title}
            </Text>
          </Stack>
        </Tab>
      ))}
    </Tabs>
  )
}

export const FormTabs = FormTabsComponent
