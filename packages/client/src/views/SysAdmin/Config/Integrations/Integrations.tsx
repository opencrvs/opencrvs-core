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
import React, { useCallback, useState } from 'react'
import { Content } from '@opencrvs/components/lib/Content'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/formConfig'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Navigation } from '@client/components/interface/Navigation'
import { Header } from '@client/components/Header/Header'
import { Plus, VerticalThreeDots } from '@client/../../components/lib/icons'
import { Link, Pill, Toast, ToggleMenu } from '@client/../../components/lib'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { Button } from '@client/../../components/lib/Button'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { connect, useDispatch, useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import { gql } from '@apollo/client'
import { updateOfflineIntegrations } from '@client/offline/actions'
import { Mutation } from '@apollo/client/react/components'
import { Integration } from '@client/utils/referenceApi'
import styled from 'styled-components'
import { Text } from '@opencrvs/components/lib/Text'

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}
export enum NOTIFICATION_STATUS {
  SUCCESS = 'success',
  IDLE = 'idle',
  IN_PROGRESS = 'inProgress',
  ERROR = 'error'
}
export interface IntegrationType {
  client_id: string
  name: string
  sha_secret: string
  status: string
}

interface ToggleModal {
  modalVisible: boolean
  selectedClient: Integration | null
}

const TopText = styled(Text)`
  margin-top: 20px;
`
const ButtonLink = styled(Link)`
  text-align: left;
`

export const deactivateClient = gql`
  mutation deactivateSystemClient($clientDetails: ClientPayload) {
    deactivateSystemClient(clientDetails: $clientDetails) {
      status
      _id
      username
      client_id
    }
  }
`
export const activateClient = gql`
  mutation reactivateSystemClient($clientDetails: ClientPayload) {
    reactivateSystemClient(clientDetails: $clientDetails) {
      status
      _id
      username
      client_id
    }
  }
`

function Integrations() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineData = useSelector(getOfflineData)
  const [showModal, setShowModal] = useState(false)
  const [clientId, setClientId] = useState('')
  const [clientStatus, setClientStatus] = useState('')
  const [toggleKeyModal, setToggleKeyModal] = useState<ToggleModal>({
    modalVisible: false,
    selectedClient: null
  })

  const [notificationStatus, setNotificationStatus] = useState(
    NOTIFICATION_STATUS.IDLE
  )
  function returnLabelText(status: string) {
    if (status === statuses.DEACTIVATED) {
      return intl.formatMessage(integrationMessages.activate)
    } else {
      return intl.formatMessage(integrationMessages.deactivate)
    }
  }

  const toggleRevealKeyModal = useCallback(
    function toggleRevealKeyModal(integration?: Integration) {
      if (integration !== undefined) {
        setToggleKeyModal({
          ...toggleKeyModal,
          modalVisible: true,
          selectedClient: integration
        })
      } else {
        setToggleKeyModal({
          ...toggleKeyModal,
          modalVisible: false
        })
      }
    },
    [toggleKeyModal]
  )

  function showSuccessToast() {
    setShowModal(false)
    setNotificationStatus(NOTIFICATION_STATUS.SUCCESS)
    dispatchChanges()
  }
  function dispatchChanges() {
    const integrations = offlineData.integrations.map(
      (integration: Integration) => {
        if (integration.client_id === clientId) {
          if (clientStatus === statuses.DEACTIVATED) {
            integration = { ...integration, status: statuses.ACTIVE }
          } else {
            integration = { ...integration, status: statuses.DEACTIVATED }
          }
          return integration
        }
        return integration
      }
    )
    dispatch(updateOfflineIntegrations({ integrations }))
  }
  function showErrorToast() {
    setShowModal(false)
    setNotificationStatus(NOTIFICATION_STATUS.ERROR)
  }
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
          {offlineData.integrations.map((integration: Integration) => (
            <ListViewItemSimplified
              key={integration.client_id}
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
                        handler: () => {
                          toggleRevealKeyModal(integration)
                        },
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
                        handler: () => {
                          setShowModal(!showModal)
                          setClientId(integration.client_id)
                          setClientStatus(integration.status)
                        },
                        label: returnLabelText(integration.status)
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
          {notificationStatus !== NOTIFICATION_STATUS.IDLE && (
            <>
              <Toast
                type={
                  notificationStatus === NOTIFICATION_STATUS.SUCCESS
                    ? 'success'
                    : notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
                    ? 'loading'
                    : 'error'
                }
                duration={3000}
                id="toggleClientStatusToast"
                onClose={() => setNotificationStatus(NOTIFICATION_STATUS.IDLE)}
              >
                {notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
                  ? intl.formatMessage(integrationMessages.loading)
                  : notificationStatus === NOTIFICATION_STATUS.SUCCESS &&
                    clientStatus === statuses.ACTIVE
                  ? intl.formatMessage(
                      integrationMessages.deactivateClientStatus
                    )
                  : notificationStatus === NOTIFICATION_STATUS.SUCCESS &&
                    clientStatus === statuses.DEACTIVATED
                  ? intl.formatMessage(integrationMessages.activateClientStatus)
                  : intl.formatMessage(integrationMessages.error)}
              </Toast>
            </>
          )}
          {showModal && (
            <ResponsiveModal
              title={
                clientStatus === statuses.ACTIVE
                  ? intl.formatMessage(integrationMessages.deactivateClient)
                  : intl.formatMessage(integrationMessages.activateClient)
              }
              contentHeight={50}
              responsive={false}
              actions={[
                <TertiaryButton
                  id="cancel"
                  key="cancel"
                  onClick={() => setShowModal(!showModal)}
                >
                  {intl.formatMessage(buttonMessages.cancel)}
                </TertiaryButton>,

                <Mutation
                  mutation={
                    clientStatus === statuses.ACTIVE
                      ? deactivateClient
                      : activateClient
                  }
                  variables={{
                    clientDetails: {
                      client_id: clientId
                    }
                  }}
                  onCompleted={() => {
                    showSuccessToast()
                  }}
                  onError={() => {
                    showErrorToast()
                  }}
                >
                  {(toggleClientStatus: any) => {
                    return (
                      <PrimaryButton
                        key="confirm"
                        id="confirm"
                        onClick={() => {
                          toggleClientStatus()
                        }}
                      >
                        {intl.formatMessage(buttonMessages.confirm)}
                      </PrimaryButton>
                    )
                  }}
                </Mutation>
              ]}
              show={true}
              handleClose={() => setShowModal(!showModal)}
            >
              {clientStatus === statuses.ACTIVE
                ? intl.formatMessage(integrationMessages.deactivateClientText)
                : intl.formatMessage(integrationMessages.activateClientText)}
            </ResponsiveModal>
          )}
        </ListViewSimplified>

        <ResponsiveModal
          actions={[
            <Link onClick={() => toggleRevealKeyModal()}>
              {intl.formatMessage(buttonMessages.cancel)}
            </Link>
          ]}
          autoHeight={true}
          titleHeightAuto={true}
          show={toggleKeyModal.modalVisible}
          handleClose={() => toggleRevealKeyModal()}
          title={toggleKeyModal.selectedClient?.name}
        >
          {intl.formatMessage(integrationMessages.uniqueKeysDescription)}

          <>
            <TopText variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.clientId)}{' '}
            </TopText>
            <Text variant="reg16" element="p">
              {' '}
              {toggleKeyModal.selectedClient?.client_id}
            </Text>

            <TopText variant="bold16" element="span">
              {' '}
              {intl.formatMessage(integrationMessages.clientSecret)}
            </TopText>
            <ButtonLink>
              {intl.formatMessage(buttonMessages.refresh)}
            </ButtonLink>

            <TopText variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.shaSecret)}
            </TopText>
            <Text variant="reg16" element="p">
              {toggleKeyModal.selectedClient?.sha_secret}
            </Text>
          </>
        </ResponsiveModal>
      </Content>
    </Frame>
  )
}
export const IntegrationList = connect()(Integrations)
