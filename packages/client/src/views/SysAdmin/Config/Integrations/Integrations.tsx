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
import React from 'react'
import { Content } from '@opencrvs/components/lib/Content'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/formConfig'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Navigation } from '@client/components/interface/Navigation'
import { Header } from '@client/components/Header/Header'
import { Plus, VerticalThreeDots } from '@client/../../components/lib/icons'
import { Pill, ToggleMenu } from '@client/../../components/lib'
import { constantsMessages } from '@client/i18n/messages'
import { Button } from '@client/../../components/lib/Button'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { connect, useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

function Integrations() {
  const intl = useIntl()
  const offlineData = useSelector(getOfflineData)

  return (
    <Frame
      header={<Header />}
      navigation={<Navigation loadWorkqueueStatuses={false} />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Content
        title={intl.formatMessage(messages.integrations)}
        topActionButtons={[
          <Button type="secondary">
            <Plus /> {intl.formatMessage(integrationMessages.createClient)}
          </Button>
        ]}
      >
        {intl.formatMessage(integrationMessages.pageIntroduction)}
        <ListViewSimplified>
          {offlineData.integrations.map((integration) => (
            <ListViewItemSimplified
              actions={
                <>
                  {integration.status === 'active' ? (
                    <Pill
                      label={intl.formatMessage(integrationMessages.active)}
                      type="active"
                    />
                  ) : (
                    <Pill
                      label={intl.formatMessage(integrationMessages.inactive)}
                      type="inactive"
                    />
                  )}

                  <ToggleMenu
                    id="toggleMenu"
                    menuItems={[
                      {
                        handler: () => {},
                        label: intl.formatMessage(
                          integrationMessages.revealKeys
                        )
                      },
                      {
                        handler: () => {},
                        label:
                          integration.status === 'active'
                            ? intl.formatMessage(integrationMessages.disable)
                            : intl.formatMessage(integrationMessages.enable)
                      },
                      {
                        handler: () => {},
                        label: intl.formatMessage(integrationMessages.delete)
                      }
                    ]}
                    toggleButton={<VerticalThreeDots />}
                  />
                </>
              }
              label={integration.name}
              value="-"
            />
          ))}
        </ListViewSimplified>
      </Content>
    </Frame>
  )
}

export const IntegrationList = connect()(Integrations)
