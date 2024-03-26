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
import {
  Box,
  Button,
  Frame,
  Stack,
  Content,
  Icon,
  ResponsiveModal,
  AppBar,
  Spinner
} from '@opencrvs/components'
import React from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useParams } from 'react-router'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { useIntl } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { goToHomeTab, goBack } from '@client/navigation'
import { useModal } from '@client/hooks/useModal'

import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import styled from 'styled-components'
import { constantsMessages } from '@client/i18n/messages'
import { usePrintableCertificate } from './usePrintableCertificate'

const CertificateContainer = styled.div``

const ReviewCertificateFrame = ({
  children
}: {
  children: React.ReactNode
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const location = useLocation<{ isNavigatedInsideApp: boolean }>()

  const back = () => {
    const historyState = location.state
    const navigatedFromInsideApp = Boolean(
      historyState && historyState.isNavigatedInsideApp
    )

    if (navigatedFromInsideApp) {
      dispatch(goBack())
    } else {
      dispatch(goToHomeTab(WORKQUEUE_TABS.readyToPrint))
    }
  }

  return (
    <Frame
      header={
        <AppBar
          desktopTitle={intl.formatMessage(
            certificateMessages.certificateCollectionTitle
          )}
          desktopLeft={
            <Button type="icon" onClick={back}>
              <Icon name="ArrowLeft" size="large" />
            </Button>
          }
          desktopRight={
            <Button
              type="icon"
              onClick={() => dispatch(goToHomeTab(WORKQUEUE_TABS.readyToPrint))}
            >
              <Icon name="X" size="large" />
            </Button>
          }
        />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToContentText
      )}
    >
      {children}
    </Frame>
  )
}

export const ReviewCertificate = () => {
  const { registrationId } = useParams<{ registrationId: string }>()
  const {
    svg,
    loading,
    handleCertify,
    isPrintInAdvanced,
    canUserEditRecord,
    handleEdit
  } = usePrintableCertificate(registrationId)
  const intl = useIntl()
  const [modal, openModal] = useModal()

  if (loading) {
    return (
      <ReviewCertificateFrame>
        <Frame.LayoutCentered>
          <Spinner id="review-certificate-loading" />
        </Frame.LayoutCentered>
      </ReviewCertificateFrame>
    )
  }

  const confirmAndPrint = async () => {
    const saveAndExitConfirm = await openModal<boolean | null>((close) => (
      <ResponsiveModal
        id="confirm-print-modal"
        title={
          isPrintInAdvanced
            ? intl.formatMessage(certificateMessages.printModalTitle)
            : intl.formatMessage(certificateMessages.printAndIssueModalTitle)
        }
        actions={[
          <Button
            type="tertiary"
            key="close-modal"
            onClick={() => {
              close(null)
            }}
            id="close-modal"
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            type="primary"
            key="print-certificate"
            onClick={handleCertify}
            id="print-certificate"
          >
            {intl.formatMessage(buttonMessages.print)}
          </Button>
        ]}
        show={true}
        handleClose={() => close(null)}
        contentHeight={100}
      >
        {isPrintInAdvanced
          ? intl.formatMessage(certificateMessages.printModalBody)
          : intl.formatMessage(certificateMessages.printAndIssueModalBody)}
      </ResponsiveModal>
    ))

    if (saveAndExitConfirm) {
      handleCertify()
    }
  }

  return (
    <ReviewCertificateFrame>
      <Frame.LayoutCentered>
        {svg && (
          <Stack direction="column">
            <Box>
              <CertificateContainer
                id="print"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </Box>
            <Content
              title={intl.formatMessage(certificateMessages.reviewTitle)}
              subtitle={intl.formatMessage(
                certificateMessages.reviewDescription
              )}
              bottomActionButtons={[
                <Button
                  key="confirm-and-print"
                  type="primary"
                  id="confirm-print"
                  onClick={confirmAndPrint}
                >
                  <Icon name="Check" size="medium" />
                  {intl.formatMessage(certificateMessages.confirmAndPrint)}
                </Button>,

                canUserEditRecord ? (
                  <Button
                    key="edit-record"
                    type="negative"
                    onClick={handleEdit}
                  >
                    {intl.formatMessage(buttonMessages.editRecord)}
                  </Button>
                ) : (
                  <></>
                )
              ]}
            ></Content>
          </Stack>
        )}
      </Frame.LayoutCentered>
      {modal}
    </ReviewCertificateFrame>
  )
}
