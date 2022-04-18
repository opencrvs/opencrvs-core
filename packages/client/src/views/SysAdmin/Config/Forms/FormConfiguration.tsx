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
import { IStoreState } from '@client/store'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Content } from '@opencrvs/components/lib/interface/Content'
import {
  messages,
  draftStatusTabMessages
} from '@client/i18n/messages/views/formConfig'
import { DraftStatus } from '@client/forms/configuration/formDrafts/reducer'
import { DraftsTab } from './DraftsTab'
import { selectFormDraftLoaded } from '@client/forms/configuration/formDrafts/selectors'
import { useLoadFormDraft } from './hooks'

export function FormConfiguration() {
  useLoadFormDraft()
  const intl = useIntl()
  const formDraftLoaded = useSelector((store: IStoreState) =>
    selectFormDraftLoaded(store)
  )
  const [selectedTab, setSelectedTab] = React.useState<string>(
    DraftStatus.DRAFT
  )
  return (
    <SysAdminContentWrapper isCertificatesConfigPage>
      <Content
        title={intl.formatMessage(messages.title)}
        tabs={{
          sections: [
            {
              id: DraftStatus.DRAFT,
              title: intl.formatMessage(draftStatusTabMessages.DRAFT)
            },
            {
              id: DraftStatus.PREVIEW,
              title: intl.formatMessage(draftStatusTabMessages.PREVIEW)
            },
            {
              id: DraftStatus.PUBLISHED,
              title: intl.formatMessage(draftStatusTabMessages.PUBLISHED)
            }
          ],
          activeTabId: selectedTab,
          onTabClick: (tabId) => setSelectedTab(tabId)
        }}
      >
        {formDraftLoaded && selectedTab === DraftStatus.DRAFT && <DraftsTab />}
      </Content>
    </SysAdminContentWrapper>
  )
}
