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
  Toast,
  ToggleMenu
} from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import { Content } from '@opencrvs/components/lib/Content'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Icon } from '@opencrvs/components/lib/Icon'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Text } from '@opencrvs/components/lib/Text'
import React, { useCallback, useState } from 'react'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  useIntegrations,
  IntegrationItem,
  IntegrationDetails
} from './useIntegrations'
import { CopyButton } from '@opencrvs/components/lib/CopyButton/CopyButton'

const ButtonLink = styled(Link)`
  text-align: left;
`

const PaddedAlert = styled(Alert)`
  margin-top: 16px;
`

const StyledSpinner = styled(Spinner)`
  margin: 10px 0;
`
const Field = styled.div`
  margin-top: 16px;
`

const ScopeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`

const ScopeTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.grey100};
  color: ${({ theme }) => theme.colors.grey500};
  font-size: 14px;
  line-height: 18px;
`

const SystemRole = z.enum(['HEALTH', 'RECORD_SEARCH'])

/** Map raw scope strings to human-readable labels */
function scopeToLabel(scope: string): string {
  return scope
}

interface ToggleActivationState {
  integration: IntegrationItem | null
}

interface RevealKeysState {
  visible: boolean
  integration: IntegrationItem | null
  details: IntegrationDetails | null
  loading: boolean
}

interface DeleteConfirmState {
  integration: IntegrationItem | null
}

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

  const [toggleActivation, setToggleActivation] =
    useState<ToggleActivationState>({ integration: null })

  const [revealKeys, setRevealKeys] = useState<RevealKeysState>({
    visible: false,
    integration: null,
    details: null,
    loading: false
  })

  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    integration: null
  })

  const [clientDetails, setClientDetails] = useState<IntegrationItem | null>(
    null
  )

  const [toastMessage, setToastMessage] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

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
    resetCreate,
    deactivateIntegration,
    isDeactivating,
    activateIntegration,
    isActivating,
    deleteIntegration,
    isDeleting,
    getIntegration,
    refreshSecret,
    refreshSecretData,
    isRefreshingSecret,
    resetRefreshSecret
  } = useIntegrations()

  const onChangeClientName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewClientName(String(event.target.value))
  }

  const clearNewSystemDraft = () => {
    setNewClientName(EMPTY_STRING)
    setNewSystemType(SystemRole.enum.HEALTH)
  }

  const handleRegisterSystem = async () => {
    const type = newSystemType
    if (type !== 'HEALTH' && type !== 'RECORD_SEARCH') {
      return
    }
    await createIntegration({ name: newClientName, type })
  }

  const handleToggleActivation = async () => {
    const integration = toggleActivation.integration
    if (!integration) return
    try {
      if (integration.status === 'active') {
        await deactivateIntegration(integration.id)
        setToastMessage({
          message: intl.formatMessage(
            integrationMessages.deactivateClientStatus
          ),
          type: 'success'
        })
      } else {
        await activateIntegration(integration.id)
        setToastMessage({
          message: intl.formatMessage(integrationMessages.activateClientStatus),
          type: 'success'
        })
      }
    } catch {
      setToastMessage({
        message: intl.formatMessage(integrationMessages.error),
        type: 'error'
      })
    }
    setToggleActivation({ integration: null })
  }

  const handleDelete = async () => {
    const integration = deleteConfirm.integration
    if (!integration) return
    try {
      await deleteIntegration(integration.id)
      setToastMessage({
        message: intl.formatMessage(integrationMessages.deleteSystemMsg),
        type: 'success'
      })
    } catch {
      setToastMessage({
        message: intl.formatMessage(integrationMessages.error),
        type: 'error'
      })
    }
    setDeleteConfirm({ integration: null })
  }

  const handleRevealKeys = async (integration: IntegrationItem) => {
    setRevealKeys({
      visible: true,
      integration,
      details: null,
      loading: true
    })
    try {
      const details = await getIntegration(integration.id)
      setRevealKeys({
        visible: true,
        integration,
        details: details as IntegrationDetails,
        loading: false
      })
    } catch {
      setRevealKeys({
        visible: true,
        integration,
        details: null,
        loading: false
      })
    }
  }

  const handleRefreshSecret = async () => {
    if (!revealKeys.integration) return
    await refreshSecret(revealKeys.integration.id)
  }

  const closeRevealKeys = () => {
    setRevealKeys({
      visible: false,
      integration: null,
      details: null,
      loading: false
    })
    resetRefreshSecret()
  }

  const getMenuItems = (integration: IntegrationItem) => {
    const menuItems: { handler: () => void; label: string }[] = [
      {
        handler: () => setClientDetails(integration),
        label: intl.formatMessage(integrationMessages.clientDetails)
      },
      {
        handler: () => handleRevealKeys(integration),
        label: intl.formatMessage(integrationMessages.revealKeys)
      },
      {
        handler: () => setToggleActivation({ integration }),
        label:
          integration.status === 'active'
            ? intl.formatMessage(integrationMessages.deactivate)
            : intl.formatMessage(integrationMessages.activate)
      },
      {
        handler: () => setDeleteConfirm({ integration }),
        label: intl.formatMessage(integrationMessages.delete)
      }
    ]
    return menuItems
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
          {integrations.map((integration: IntegrationItem) => (
            <ListViewItemSimplified
              key={integration.id}
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
                    id={`toggleMenu-${integration.id}`}
                    menuItems={getMenuItems(integration)}
                    toggleButton={
                      <Icon
                        name="DotsThreeVertical"
                        color="primary"
                        size="large"
                      />
                    }
                  />
                </>
              }
              label={integration.name}
              value={
                <Text variant="reg14" element="p" color="grey500">
                  {integration.createdByName
                    ? intl.formatMessage(integrationMessages.createdOnBy, {
                        date: intl.formatDate(new Date(integration.createdAt), {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }),
                        user: integration.createdByName
                      })
                    : intl.formatMessage(integrationMessages.createdOn, {
                        date: intl.formatDate(new Date(integration.createdAt), {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      })}
                </Text>
              }
            />
          ))}
        </ListViewSimplified>
      </Content>

      {/* Client Details Modal */}
      {clientDetails && (
        <ResponsiveModal
          title={intl.formatMessage(integrationMessages.clientDetails)}
          autoHeight={true}
          width={512}
          titleHeightAuto={true}
          show={true}
          handleClose={() => setClientDetails(null)}
          actions={[
            <Button
              type="tertiary"
              key="close"
              id="closeClientDetails"
              onClick={() => setClientDetails(null)}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Button>
          ]}
        >
          <Stack direction="column" alignItems="stretch" gap={16}>
            <Stack direction="column" alignItems="stretch" gap={4}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.clientName)}
              </Text>
              <Text variant="reg16" element="span">
                {clientDetails.name}
              </Text>
            </Stack>
            <Stack direction="column" alignItems="stretch" gap={8}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.scopes)}
              </Text>
              <ScopeList>
                {clientDetails.scopes.map((scope) => (
                  <ScopeTag key={scope}>{scopeToLabel(scope)}</ScopeTag>
                ))}
              </ScopeList>
            </Stack>
          </Stack>
        </ResponsiveModal>
      )}

      {/* Toggle Activation Modal */}
      {toggleActivation.integration && (
        <ResponsiveModal
          title={
            toggleActivation.integration.status === 'active'
              ? intl.formatMessage(integrationMessages.deactivateClient)
              : intl.formatMessage(integrationMessages.activateClient)
          }
          contentHeight={50}
          responsive={false}
          actions={[
            <Button
              type="tertiary"
              id="cancel"
              key="cancel"
              onClick={() => setToggleActivation({ integration: null })}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Button>,
            <Button
              type="primary"
              key="confirm"
              id="confirm"
              loading={isDeactivating || isActivating}
              onClick={handleToggleActivation}
            >
              {intl.formatMessage(buttonMessages.confirm)}
            </Button>
          ]}
          show={true}
          handleClose={() => setToggleActivation({ integration: null })}
        >
          {toggleActivation.integration.status === 'active'
            ? intl.formatMessage(integrationMessages.deactivateClientText)
            : intl.formatMessage(integrationMessages.activateClientText)}
        </ResponsiveModal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.integration && (
        <ResponsiveModal
          title={intl.formatMessage(integrationMessages.delete)}
          contentHeight={50}
          responsive={false}
          actions={[
            <Button
              type="tertiary"
              id="cancelDelete"
              key="cancelDelete"
              onClick={() => setDeleteConfirm({ integration: null })}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Button>,
            <Button
              type="primary_destructive"
              key="confirmDelete"
              id="confirmDelete"
              loading={isDeleting}
              onClick={handleDelete}
            >
              {intl.formatMessage(integrationMessages.delete)}
            </Button>
          ]}
          show={true}
          handleClose={() => setDeleteConfirm({ integration: null })}
        >
          <FormattedMessage
            {...integrationMessages.deleteSystemText}
            values={{ b: (chunks: React.ReactNode) => <b>{chunks}</b> }}
          />
        </ResponsiveModal>
      )}

      {/* Reveal Keys Modal */}
      <ResponsiveModal
        actions={[
          <Link key="cancel-link" onClick={closeRevealKeys}>
            {intl.formatMessage(buttonMessages.cancel)}
          </Link>
        ]}
        autoHeight={true}
        width={512}
        titleHeightAuto={true}
        show={revealKeys.visible}
        handleClose={closeRevealKeys}
        title={revealKeys.integration?.name ?? ''}
      >
        <Text variant="reg16" element="p" id="revealKeyId">
          {intl.formatMessage(integrationMessages.uniqueKeysDescription)}
        </Text>

        {revealKeys.loading ? (
          <Spinner id="revealKeysSpinner" size={24} />
        ) : (
          <Stack alignItems="stretch" direction="column" gap={16}>
            <Stack alignItems="stretch" direction="column" gap={8}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.clientId)}
              </Text>
              <Stack justifyContent="space-between" alignItems="center">
                <Text variant="reg16" element="span">
                  {revealKeys.integration?.id}
                </Text>
                <CopyButton
                  copiedLabel={intl.formatMessage(buttonMessages.copied)}
                  copyLabel={intl.formatMessage(buttonMessages.copy)}
                  data={revealKeys.integration?.id as string}
                />
              </Stack>
            </Stack>
            <Stack direction="column" alignItems="stretch" gap={8}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.clientSecret)}
              </Text>
              {isRefreshingSecret ? (
                <Spinner baseColor="#4C68C1" id="Spinner" size={24} />
              ) : refreshSecretData ? (
                <Stack justifyContent="space-between" alignItems="center">
                  <Text variant="reg16" element="span">
                    {refreshSecretData.clientSecret}
                  </Text>
                  <CopyButton
                    copiedLabel={intl.formatMessage(buttonMessages.copied)}
                    copyLabel={intl.formatMessage(buttonMessages.copy)}
                    data={refreshSecretData.clientSecret}
                  />
                </Stack>
              ) : (
                <ButtonLink onClick={handleRefreshSecret}>
                  {intl.formatMessage(buttonMessages.refresh)}
                </ButtonLink>
              )}
            </Stack>
            <Stack direction="column" alignItems="stretch" gap={8}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.shaSecret)}
              </Text>
              <Stack justifyContent="space-between" alignItems="center">
                <Text variant="reg16" element="span">
                  {revealKeys.details?.shaSecret ?? '—'}
                </Text>
                {revealKeys.details?.shaSecret && (
                  <CopyButton
                    copiedLabel={intl.formatMessage(buttonMessages.copied)}
                    copyLabel={intl.formatMessage(buttonMessages.copy)}
                    data={revealKeys.details.shaSecret}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
        )}
      </ResponsiveModal>

      {/* Create Client Modal */}
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
          id="createErrorToast"
          onClose={() => {
            resetCreate()
          }}
        >
          {intl.formatMessage(integrationMessages.error)}
        </Toast>
      )}

      {toastMessage && (
        <Toast
          type={toastMessage.type === 'success' ? 'success' : 'error'}
          id="actionToast"
          onClose={() => setToastMessage(null)}
        >
          {toastMessage.message}
        </Toast>
      )}
    </WithFrame>
  )
}
