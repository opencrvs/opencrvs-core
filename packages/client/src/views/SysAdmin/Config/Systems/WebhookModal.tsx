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

import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { Label } from '@client/views/Settings/items/components'
import {
  ISystem,
  WebhookOption,
  WebHookSetting
} from '@client/views/SysAdmin/Config/Systems/Systems'
import { useSystems } from '@client/views/SysAdmin/Config/Systems/useSystems'
import {
  CheckboxGroup,
  Divider,
  FormTabs,
  InputField,
  ResponsiveModal
} from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'

interface IWebhookModal {
  onClose: () => void
  clientId: string
  system: ISystem
}

export function WebhookModal({ onClose, clientId, system }: IWebhookModal) {
  const intl = useIntl()

  const [selectedTab, setSelectedTab] = React.useState(WebhookOption.birth)
  const {
    existingSystems,
    setBirthPermissions,
    setDeathPermissions,
    deathPermissions,
    birthPermissions
  } = useSystems()

  const selectedSystem = existingSystems.find(
    (system) => system.clientId === clientId
  )!

  const [permissions, setPermissions] = useState(
    selectedSystem.webhookPermissions || []
  )

  const checkboxHandler = (items: string[], type: string) => {
    const val: WebHookSetting = {
      event: type,
      permissions: items
    }
    type === WebhookOption.birth
      ? setBirthPermissions(val)
      : setDeathPermissions(val)
  }

  const populatePermissions = (
    webhooks: WebHookSetting[] = [],
    type: string
  ) => {
    const res = webhooks
      .filter((item: WebHookSetting) => item.event === type)
      .map((it) => it.permissions)

    console.log(res)
    return []
  }

  return (
    <>
      <ResponsiveModal
        actions={[
          <Button onClick={onClose} type="primary">
            Submit
          </Button>,
          <Button onClick={onClose} type="secondary">
            Cancel
          </Button>
        ]}
        show
        handleClose={onClose}
        title="Webhook"
        autoHeight
        titleHeightAuto
      >
        <>
          <InputField
            id="select-input"
            touched={false}
            label={intl.formatMessage(integrationMessages.label)}
          >
            <Label>
              {intl.formatMessage(integrationMessages.webhookDescription)}
            </Label>
          </InputField>
          <FormTabs
            sections={[
              {
                id: WebhookOption.birth,
                title: intl.formatMessage(integrationMessages.birth)
              },
              {
                id: WebhookOption.death,
                title: intl.formatMessage(integrationMessages.death)
              }
            ]}
            activeTabId={selectedTab}
            onTabClick={(tabId: WebhookOption) => setSelectedTab(tabId)}
          />
          <Divider />
          {selectedTab === WebhookOption.birth ? (
            <>
              <CheckboxGroup
                id="test-checkbox-group1"
                options={[
                  {
                    label: intl.formatMessage(
                      integrationMessages.registrationDetails
                    ),
                    value: 'registration-details'
                  },
                  {
                    label: intl.formatMessage(integrationMessages.childDetails),
                    value: 'child-details'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.motherDetails
                    ),
                    value: 'mothers-details'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.fatherDetails
                    ),
                    value: 'fathers-details'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.informantDetails
                    ),
                    value: 'informant-details'
                  }
                ]}
                name="test-checkbox-group1"
                value={
                  populatePermissions(
                    system.webhook as WebHookSetting[],
                    WebhookOption.birth
                  ) ?? []
                }
                onChange={(newValue) => {
                  console.log('new val', newValue)
                  checkboxHandler(newValue, WebhookOption.birth)
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
                      integrationMessages.registrationDetails
                    ),
                    value: 'registration-details'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.motherDetails
                    ),
                    value: 'mothers-details'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.fatherDetails
                    ),
                    value: 'fathers-details'
                  },
                  {
                    label: intl.formatMessage(
                      integrationMessages.informantDetails
                    ),
                    value: 'informant-details'
                  },
                  {
                    label: 'Disease Details',
                    value: 'disease-details'
                  }
                ]}
                name="test-checkbox-group1"
                value={deathPermissions.permissions ?? []}
                onChange={(newValue) => {
                  checkboxHandler(newValue, WebhookOption.death)
                }}
              />
            </>
          )}
        </>
      </ResponsiveModal>
    </>
  )
}
