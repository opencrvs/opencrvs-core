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
import { useIntl } from 'react-intl'
import { Content, ContentSize, FormTabs } from '@opencrvs/components'
import { advancedSearchMessages as messages } from '@client/v2-events/messages'

function AdvancedSearch() {
  const intl = useIntl()
  const activeSections = [
    {
      id: '',
      title: intl.formatMessage(messages.birthTabTitle)
    }
  ]
  return (
    <>
      <Content
        size={ContentSize.SMALL}
        subtitle={intl.formatMessage(messages.advancedSearchInstruction)}
        tabBarContent={
          <FormTabs
            activeTabId={intl.formatMessage(messages.birthTabTitle)}
            sections={activeSections}
            onTabClick={() => {
              alert('tab clicked')
            }}
          />
        }
        title={intl.formatMessage(messages.advancedSearch)}
        titleColor={'copy'}
      ></Content>
    </>
  )
}

export default AdvancedSearch
