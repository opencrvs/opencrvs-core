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
import { Header } from '@client/components/Header/Header'
import { Navigation } from '@client/components/interface/Navigation'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { EMPTY_STRING } from '@client/utils/constants'
import { z } from 'zod'
import {
  Alert,
  InputField,
  Link,
  ListViewItemSimplified,
  ListViewSimplified,
  Pill,
  Select,
  Spinner,
  Stack,
  TextInput,
  Toast
} from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import { Content } from '@opencrvs/components/lib/Content'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Icon } from '@opencrvs/components/lib/Icon'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Text } from '@opencrvs/components/lib/Text'
import React, { useCallback, useState } from 'react'
import { IntlShape, useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  useIntegrations,
  IntegrationItem
} from './useIntegrations'
import { CopyButton } from '@opencrvs/components/lib/CopyButton/CopyButton'

const PaddedAlert = styled(Alert)`
  margin-top: 16px;
`

const StyledSpinner = styled(Spinner)`
  margin: 10px 0;
`
const Field = styled.div`
  margin-top: 16px;
`

const SystemRole = z.enum(['HEALTH', 'RECORD_SEARCH'])

/**
 * Wrapper component that adds Frame around the page if withFrame is true.
 * Created only for minimising impact of possible regression during v2 regression test period.
 */
function WithFrame({
  children,
  isHidden,
  intl,
  toggleModal
}: {
  children: React.ReactNode
  isHidden: boolean
  intl: IntlShape
  toggleModal: () => void
}) {
  if (isHidden) {
    return <>{children}</>
  }

  return (
    <Frame
      header={
        <Header
          mobileRight={[
            {
              icon: () => <Icon name="Plus" />,
              handler: toggleModal
            }
          ]}
        />
      }
      navigation={<Navigation loadWorkqueueStatuses={false} />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      {children}
    </Frame>
  )
}

export function SystemList({ hideNavigation }: { hideNavigation?: boolean }) {
  const intl = useIntl()
  const [showModal, setShowModal] = React.useState(false)
  const [newClientName, setNewClientName] = useState(EMPTY_STRING)
  const [newSystemType, setNewSystemType] = useState<string>(
    SystemRole.enum.HEALTH
  )

  const toggleModal = useCallback(() => {
    setShowModal((prev) => !prev)
  }, [])

  const {
    integrations,
    isLoading,
    createIntegration,
    createResult,
    isCreating,
    createError,
    resetCreate
  } = useIntegrations()

  const onChangeClientName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewClientName(String(event.target.value))
  }

  const clearNewSystemDraft = () => {
    setNewClientName(EMPTY_STRING)
    setNewSystemType(SystemRole.enum.HEALTH)
  }

  const systemToLabel = (system: IntegrationItem) => {
    // Derive a human-readable type label from scopes
    if (system.scopes.includes('notification-api')) {
      return intl.formatMessage(integrationMessages.integrationType, {
        type: 'HEALTH'
      })
    }
    if (system.scopes.includes('recordsearch')) {
      return intl.formatMessage(integrationMessages.integrationType, {
        type: 'RECORD_SEARCH'
      })
    }
    return system.scopes.join(', ')
  }

  const handleRegisterSystem = async () => {
    await createIntegration({
      name: newClientName,
      type: newSystemType as 'HEALTH' | 'RECORD_SEARCH'
    })
  }

  return (
    <WithFrame
      isHidden={!!hideNavigation}
      intl={intl}
      toggleModal={toggleModal}
    >
      <Content
        title={intl.formatMessage(integrationMessages.pageTitle)}
        topActionButtons={[
          <Button
            key="create-client-button"
            type="secondary"
            id="createClientButton"
            onClick={() => setShowModal(true)}
          >
            <Icon name="Plus" />
            {intl.formatMessage(integrationMessages.createClient)}
          </Button>
        ]}
      >
        {intl.formatMessage(integrationMessages.pageIntroduction)}

        {isLoading && <Spinner id="system-list-spinner" size={24} />}

        <ListViewSimplified>
          {integrations.map((system: IntegrationItem) => (
            <ListViewItemSimplified
              key={system.id}
              actions={
                <>
                  {system.status === 'active' ? (
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
                </>
              }
              label={system.name}
              value={systemToLabel(system)}
            />
          ))}
        </ListViewSimplified>
      </Content>
      <ResponsiveModal
        actions={
          createResult
            ? []
            : [
                <Link
                  key="cancel"
                  onClick={() => {
                    toggleModal()
                    clearNewSystemDraft()
                    resetCreate()
                  }}
                >
                  {intl.formatMessage(buttonMessages.cancel)}
                </Link>,
                <Button
                  key="submit-client-form"
                  id="submitClientForm"
                  disabled={!newSystemType || newClientName === EMPTY_STRING}
                  onClick={() => {
                    handleRegisterSystem()
                  }}
                  type="primary"
                >
                  {intl.formatMessage(buttonMessages.create)}
                </Button>
              ]
        }
        width={512}
        autoHeight={true}
        titleHeightAuto={true}
        show={showModal}
        handleClose={() => {
          toggleModal()
          clearNewSystemDraft()
          resetCreate()
        }}
        title={
          createResult
            ? newClientName
            : intl.formatMessage(integrationMessages.createClient)
        }
        id="createClientModal"
      >
        <Text variant="reg16" element="p" id="uniqueKeyId">
          {!createResult && !isCreating
            ? intl.formatMessage(integrationMessages.newIntegrationDescription)
            : intl.formatMessage(integrationMessages.uniqueKeysDescription)}
        </Text>

        {!createResult && !isCreating && (
          <>
            <Field>
              <InputField
                id="name_of_client"
                touched={false}
                required={true}
                label={intl.formatMessage(integrationMessages.name)}
              >
                <TextInput
                  id="client_name"
                  type="text"
                  value={newClientName}
                  onChange={onChangeClientName}
                  error={false}
                />
              </InputField>
            </Field>

            <Field>
              <InputField
                id="select-input"
                touched={false}
                label={intl.formatMessage(integrationMessages.type)}
              >
                <Select
                  onChange={(val) => {
                    setNewSystemType(val)
                  }}
                  value={newSystemType}
                  options={[
                    {
                      label: intl.formatMessage(
                        integrationMessages.integrationType,
                        {
                          type: SystemRole.enum.HEALTH
                        }
                      ),
                      value: SystemRole.enum.HEALTH
                    },
                    {
                      label: intl.formatMessage(
                        integrationMessages.integrationType,
                        { type: SystemRole.enum.RECORD_SEARCH }
                      ),
                      value: SystemRole.enum.RECORD_SEARCH
                    }
                  ]}
                  id={'permissions-selectors'}
                />
              </InputField>
            </Field>

            {newSystemType === SystemRole.enum.HEALTH && (
              <PaddedAlert type="info">
                {intl.formatMessage(
                  integrationMessages.healthnotificationAlertDescription
                )}
                <Link
                  onClick={() => {
                    window.open('https://documentation.opencrvs.org/', '_blank')
                  }}
                  font="bold16"
                >
                  documentation.opencrvs.org
                </Link>
              </PaddedAlert>
            )}

            {newSystemType === SystemRole.enum.RECORD_SEARCH && (
              <PaddedAlert type="info">
                {intl.formatMessage(
                  integrationMessages.recordSearchDescription
                )}
                {'\n'}
                <Link
                  onClick={() => {
                    window.open('https://documentation.opencrvs.org/', '_blank')
                  }}
                  font="bold16"
                >
                  documentation.opencrvs.org
                </Link>
              </PaddedAlert>
            )}
          </>
        )}

        {!createResult && isCreating && (
          <>
            <Text variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.clientId)}
              <StyledSpinner size={24} id="Spinner" />
            </Text>
            <Text variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.clientSecret)}
              <StyledSpinner size={24} id="Spinner" />
            </Text>
            <Text variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.shaSecret)}
              <StyledSpinner size={24} id="Spinner" />
            </Text>
          </>
        )}

        {createResult && (
          <Stack alignItems="stretch" direction="column" gap={16}>
            <Stack alignItems="stretch" direction="column" gap={4}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.clientId)}
              </Text>
              <Stack justifyContent="space-between" alignItems="center">
                <Text variant="reg16" element="span">
                  {createResult.clientId}
                </Text>
                <CopyButton
                  copiedLabel={intl.formatMessage(buttonMessages.copied)}
                  copyLabel={intl.formatMessage(buttonMessages.copy)}
                  data={createResult.clientId}
                />
              </Stack>
            </Stack>
            <Stack alignItems="stretch" direction="column" gap={4}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.clientSecret)}
              </Text>
              <Stack justifyContent="space-between" alignItems="center">
                <Text variant="reg16" element="span">
                  {createResult.clientSecret}
                </Text>
                <CopyButton
                  copiedLabel={intl.formatMessage(buttonMessages.copied)}
                  copyLabel={intl.formatMessage(buttonMessages.copy)}
                  data={createResult.clientSecret}
                />
              </Stack>
            </Stack>
            <Stack alignItems="stretch" direction="column" gap={4}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.shaSecret)}
              </Text>
              <Stack justifyContent="space-between" alignItems="center">
                <Text variant="reg16" element="span">
                  {createResult.shaSecret}
                </Text>
                <CopyButton
                  copiedLabel={intl.formatMessage(buttonMessages.copied)}
                  copyLabel={intl.formatMessage(buttonMessages.copy)}
                  data={createResult.shaSecret}
                />
              </Stack>
            </Stack>
          </Stack>
        )}
      </ResponsiveModal>

      {createError && (
        <Toast
          type="error"
          id="toggleClientStatusToast"
          onClose={() => {
            resetCreate()
          }}
        >
          {intl.formatMessage(integrationMessages.error)}
        </Toast>
      )}
    </WithFrame>
  )
}

