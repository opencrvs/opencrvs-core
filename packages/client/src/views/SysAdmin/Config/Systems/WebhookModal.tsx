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
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import {
  UpdatePermissionsMutation,
  UpdatePermissionsMutationVariables
} from '@client/utils/gateway'
import { Label } from '@client/views/Settings/items/components'
import {
  ISystemProps,
  WebhookOption,
  WebHookSetting
} from '@client/views/SysAdmin/Config/Systems/model'
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

const populatePermissions = (webhooks: WebHookSetting[] = [], type: string) => {
  return webhooks.find((ite) => ite.event === type)!
}

export function WebhookModal({ cancel, system }: ISystemProps) {
  const intl = useIntl()
  const [selectedTab, setSelectedTab] = useState(WebhookOption.birth)

  const [birthPermissions, setBirthPermissions] = useState(
    populatePermissions(system.webhook, WebhookOption.birth)
  )

  const [deathPermissions, setDeathPermissions] = useState(
    populatePermissions(system.webhook, WebhookOption.death)
  )

  const [
    updateWebhookPermissions,
    {
      data: updateWebhookSystemData,
      error: updateWebhookSystemError,
      loading: updateWebhookSystemLoading,
      reset: resetWebhookSystemSystemData
    }
  ] = useMutation<
    UpdatePermissionsMutation,
    UpdatePermissionsMutationVariables
  >(mutations.updateSystemPermissions, {
    onCompleted: ({ updatePermissions }) => {
      //if (registerSystem) dispatchNewSystem(registerSystem.system)
    }
  })

  const checkboxHandler = (permissions: string[], event: WebhookOption) => {
    event === WebhookOption.birth
      ? setBirthPermissions({ event, permissions })
      : setDeathPermissions({ event, permissions })
  }

  const updateHandler = () => {
    const payload = {
      setting: {
        clientId: system.clientId,
        webhook: [birthPermissions, deathPermissions]
      }
    }
    console.log()
    debugger
    updateWebhookPermissions({
      variables: {
        setting: {
          clientId: system.clientId,
          webhook: [birthPermissions, deathPermissions]
        }
      }
    })
  }

  if (updateWebhookSystemError) {
    return (
      <Toast
        type="error"
        id="toggleClientStatusToast"
        onClose={() => {
          resetWebhookSystemSystemData()
          cancel()
        }}
      >
        {intl.formatMessage(integrationMessages.error)}
      </Toast>
    )
  }

  return (
    <>
      <ResponsiveModal
        actions={[
          <Button
            onClick={() => updateHandler()}
            type="primary"
            loading={updateWebhookSystemLoading}
          >
            Submit
          </Button>,
          <Button onClick={cancel} type="secondary">
            Cancel
          </Button>
        ]}
        show
        handleClose={cancel}
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
