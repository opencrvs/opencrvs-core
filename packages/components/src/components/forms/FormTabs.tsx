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
import { Tab, Tabs } from '../interface/Tabs'

export interface IFormTabs {
  id: string
  title: string
  disabled?: boolean
}

interface IFormTabProps {
  sections: IFormTabs[]
  activeTabId: string
  onTabClick: (tabId: string) => void
}

function FormTabsComponent({
  sections,
  activeTabId,
  onTabClick
}: IFormTabProps) {
  return (
    <Tabs>
      {sections.map(({ title, id, disabled }) => (
        <Tab
          id={`tab_${id}`}
          onClick={() => onTabClick(id)}
          key={id}
          active={activeTabId === id}
          disabled={disabled}
        >
          {title}
        </Tab>
      ))}
    </Tabs>
  )
}

export const FormTabs = FormTabsComponent
