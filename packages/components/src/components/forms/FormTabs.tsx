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
import { Tab, Tabs } from '@opencrvs/components/lib/interface'
import { IFormSection } from '@client/forms'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'

interface IFormTabProps {
  sections: IFormSection[]
  activeTabId: string
  onTabClick: (tabId: string) => void
}

function FormTabsComponent({
  sections,
  activeTabId,
  onTabClick,
  intl
}: IFormTabProps & IntlShapeProps) {
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
          {/* {intl.formatMessage(name)} */}
          {title}
        </Tab>
      ))}
    </Tabs>
  )
}

export const FormTabs = injectIntl(FormTabsComponent)
