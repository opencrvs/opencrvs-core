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
import { useIntl } from 'react-intl'

import { buttonMessages } from '@client/i18n/messages'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { System, WebhookPermission, Event } from '@client/utils/gateway'
import { CheckboxGroup, FormTabs, ResponsiveModal } from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import React, { useState } from 'react'

interface ISystemProps {
  system: System
  loading: boolean
  closeModal: () => void
  updatePermissions: () => void
  birthPermissions: WebhookPermission
  deathPermissions: WebhookPermission
  setDeathPermissions: React.Dispatch<WebhookPermission>
  setBirthPermissions: React.Dispatch<WebhookPermission>
}

export function WebhookModal({
  loading,
  system,
  closeModal,
  birthPermissions,
  deathPermissions,
  updatePermissions,
  setDeathPermissions,
  setBirthPermissions
}: ISystemProps) {
  const intl = useIntl()
  const [selectedTab, setSelectedTab] = useState(Event.Birth)

  const checkboxHandler = (permissions: string[], event: Event) => {
    event === Event.Birth
      ? setBirthPermissions({ event, permissions })
      : setDeathPermissions({ event, permissions })
  }

  return (
    <>
      <ResponsiveModal
        actions={[
          <Button key="close-modal" onClick={closeModal} type="secondary">
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            key="update-permissions"
            onClick={updatePermissions}
            type="primary"
            loading={loading}
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        ]}
        show
        handleClose={closeModal}
        title={system.name}
        autoHeight
        titleHeightAuto
      >
        <>
          <FormTabs
            sections={[
              {
                id: Event.Birth,
                title: intl.formatMessage(integrationMessages.birth)
              },
              {
                id: Event.Death,
                title: intl.formatMessage(integrationMessages.death)
              }
            ]}
            activeTabId={selectedTab}
            onTabClick={(tabId: Event) => setSelectedTab(tabId)}
          />
          {selectedTab === Event.Birth ? (
            <>
              <CheckboxGroup
                id="test-checkbox-group1"
                options={[
                  {
                    label: intl.formatMessage(integrationMessages.childDetails),
                    value: 'child-details'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.motherDetails
                    ),
                    value: 'mother-details'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.fatherDetails
                    ),
                    value: 'father-details'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.informantDetails
                    ),
                    value: 'informant-details'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.documentDetails
                    ),
                    value: 'supporting-documents'
                  }
                ]}
                name="test-checkbox-group1"
                value={birthPermissions && birthPermissions.permissions}
                onChange={(permissions) => {
                  checkboxHandler(permissions, Event.Birth)
                }}
              />
            </>
          ) : (
            <>
              <CheckboxGroup
                id="test-checkbox-group2"
                options={[
                  {
                    label: intl.formatMessage(
                      integrationMessages.deceasedDetails
                    ),
                    value: 'deceased-details'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.deathEventDetails
                    ),
                    value: 'death-encounter'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.informantDetails
                    ),
                    value: 'informant-details'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.documentDetails
                    ),
                    value: 'supporting-documents'
                  }
                ]}
                name="test-checkbox-group1"
                value={deathPermissions && deathPermissions.permissions}
                onChange={(permissions) => {
                  checkboxHandler(permissions, Event.Death)
                }}
              />
            </>
          )}
        </>
      </ResponsiveModal>
    </>
  )
}
