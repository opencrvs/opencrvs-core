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
import { Tab } from './components/Tab'
import { Stack } from '../Stack'

export interface IFormTabs<T extends string | number = string> {
  id: T
  title: string
  disabled?: boolean
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
    <Stack
      alignItems="center"
      direction="row"
      gap={16}
      justifyContent="flex-start"
    >
      {sections.map(({ title, id, disabled }) => (
        <Tab
          type="tertiary"
          size="small"
          id={`tab_${id}`}
          onClick={() => onTabClick(id)}
          key={id}
          active={activeTabId === id}
          disabled={disabled}
        >
          {title}
        </Tab>
      ))}
    </Stack>
  )
}

export const FormTabs = FormTabsComponent
