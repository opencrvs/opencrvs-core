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

import { useMutation } from '@apollo/client'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import {
  System,
  UpdatePermissionsMutation,
  UpdatePermissionsMutationVariables,
  WebhookPermission
} from '@client/utils/gateway'
import { Label } from '@client/views/Settings/items/components'
import { WebhookOption } from '@client/views/SysAdmin/Config/Systems/model'
import * as mutations from '@client/views/SysAdmin/Config/Systems/mutations'
import { useSystems } from '@client/views/SysAdmin/Config/Systems/useSystems'
import {
  CheckboxGroup,
  Divider,
  FormTabs,
  InputField,
  ResponsiveModal,
  Toast
} from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'

interface ISystemProps {
  updatePermissions: () => void
  birthPermissions: WebhookPermission
  deathPermissions: WebhookPermission
  setBirthPermissions: React.Dispatch<WebhookPermission>
  setDeathPermissions: React.Dispatch<WebhookPermission>
  closeModal: () => void
  loading: boolean
}

const populatePermissions = (
  webhooks: WebhookPermission[] = [],
  type: string
) => {
  return webhooks.find((ite) => ite.event === type)!
}

export function WebhookModal({
  updatePermissions,
  birthPermissions,
  deathPermissions,
  setDeathPermissions,
  setBirthPermissions,
  closeModal,
  loading
}: ISystemProps) {
  const intl = useIntl()
  const [selectedTab, setSelectedTab] = useState(WebhookOption.birth)

  const checkboxHandler = (permissions: string[], event: WebhookOption) => {
    event === WebhookOption.birth
      ? setBirthPermissions({ event, permissions })
      : setDeathPermissions({ event, permissions })
  }

  return (
    <>
      <ResponsiveModal
        actions={[
          <Button onClick={updatePermissions} type="primary" loading={loading}>
            Submit
          </Button>,
          <Button onClick={closeModal} type="secondary">
            Cancel
          </Button>
        ]}
        show
        handleClose={closeModal}
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
                value={birthPermissions && birthPermissions.permissions}
                onChange={(permissions) => {
                  debugger
                  checkboxHandler(permissions, WebhookOption.birth)
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
                value={deathPermissions && deathPermissions.permissions}
                onChange={(permissions) => {
                  checkboxHandler(permissions, WebhookOption.death)
                }}
              />
            </>
          )}
        </>
      </ResponsiveModal>
    </>
  )
}
