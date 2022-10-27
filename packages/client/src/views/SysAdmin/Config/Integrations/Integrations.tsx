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

interface IIntegration {
  name: string
  status: string
  systemId: string
}

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

export function IntegrationList() {
  const intl = useIntl()

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
          <ListViewItemSimplified
            actions={
              <>
                <Pill label="Active" type="active" />
                <ToggleMenu
                  id="toggleMenu"
                  menuItems={[
                    { handler: () => {}, label: 'Reveal Keys' },
                    { handler: () => {}, label: 'Disable' },
                    { handler: () => {}, label: 'Delete' }
                  ]}
                  toggleButton={<VerticalThreeDots />}
                />
              </>
            }
            label="Sweet Health"
            value="Health Integration"
          />
        </ListViewSimplified>
      </Content>
    </Frame>
  )
}
