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
import { defineMessages, useIntl } from 'react-intl'
import { Content, ContentSize, FormTabs } from '@opencrvs/components'

const messagesToDefine = {
  birthTabTitle: {
    id: 'config.application.birthTabTitle',
    defaultMessage: 'Birth',
    description: 'The title for birth tab'
  },
  birthTabTitleExport: {
    id: 'config.application.birthTabTitleExport',
    defaultMessage: 'Births',
    description: 'The title for birth tab for VSExport'
  },
  deathTabTitle: {
    id: 'config.application.deathTabTitle',
    defaultMessage: 'Death',
    description: 'The title for death tab'
  },
  deathTabTitleExport: {
    id: 'config.application.deathTabTitleExport',
    defaultMessage: 'Deaths',
    description: 'The title for death tab for VSExport'
  },
  advancedSearch: {
    id: 'config.advanced.search',
    defaultMessage: 'Advanced Search',
    description: 'This is used for the advanced search'
  },
  advancedSearchInstruction: {
    id: 'config.advanced.search.instruction',
    defaultMessage:
      'Select the options to build an advanced search. A minimum of two search parameters is required.',
    description: 'This is used for the advanced search'
  }
}

const messages = defineMessages(messagesToDefine)

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
