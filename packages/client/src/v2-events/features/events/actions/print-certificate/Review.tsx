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

import React, { useEffect } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import styled from 'styled-components'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { ActionType } from '@opencrvs/commons/client'
import {
  Box,
  Button,
  Content,
  Frame,
  Icon,
  ResponsiveModal,
  Spinner,
  Stack
} from '@opencrvs/components'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { FormLayout } from '@client/v2-events/layouts/form'
import { usePrintableCertificate } from '@client/v2-events/hooks/usePrintableCertificate'
import { useAppConfig } from '@client/v2-events/hooks/useAppConfig'

const CertificateContainer = styled.div`
  svg {
    /* limits the certificate overflowing on small screens */
    max-width: 100%;
  }
`

const messages = defineMessages({
  printTitle: {
    id: 'printAction.title',
    defaultMessage: 'Print certificate',
    description: 'The title for print action'
  },
  printDescription: {
    id: 'printAction.description',
    defaultMessage:
      'Please confirm that the informant has reviewed that the information on the certificate is correct and that it is ready to print.',
    description: 'The description for print action'
  },
  printModalTitle: {
    id: 'print.certificate.review.printModalTitle',
    defaultMessage: 'Print certificate?',
    description: 'Print certificate modal title text'
  },
  printAndIssueModalTitle: {
    id: 'print.certificate.review.printAndIssueModalTitle',
    defaultMessage: 'Print and issue certificate?',
    description: 'Print and issue certificate modal title text'
  },
  printModalBody: {
    id: 'print.certificate.review.modal.body.print',
    defaultMessage:
      'A PDF of the certificate will open in a new tab for printing. The record will move to the ready-to-issue queue.',
    description: 'Print certificate modal body text'
  },
  printAndIssueModalBody: {
    id: 'print.certificate.review.modal.body.printAndIssue',
    defaultMessage:
      'A PDF of the certificate will open in a new tab for printing and issuing.',
    description: 'Print certificate modal body text'
  },
  makeCorrection: {
    id: 'print.certificate.button.makeCorrection',
    defaultMessage: 'No, make correction',
    description: 'The label for correction button of print action'
  },
  confirmPrint: {
    id: 'print.certificate.button.confirmPrint',
    defaultMessage: 'Yes, print certificate',
    description: 'The text for print button'
  },
  cancel: {
    id: 'buttons.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button text in the modal'
  },
  print: {
    id: 'buttons.print',
    defaultMessage: 'Print',
    description: 'Print button text'
  }
})

export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.PRINT_CERTIFICATE)
  const [{ templateId }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.PRINT_CERTIFICATE.REVIEW
  )
  const intl = useIntl()
  const navigate = useNavigate()

  const { certificatesTemplate, language } = useAppConfig()
  const events = useEvents()
  const [modal, openModal] = useModal()
  const { getFormValues, clear } = useEventFormData()

  const [event] = events.getEvent.useSuspenseQuery(eventId)
  const { eventConfiguration: config } = useEventConfiguration(event.type)

  if (!config) {
    throw new Error(`Event configuration not found for type: ${event.type}`)
  }

  const form = getFormValues(eventId)
  const certificateConfig = certificatesTemplate.find(
    (template) => template.id === templateId
  )
  const { svgCode, handleCertify, isPrintInAdvance, canUserEditRecord } =
    usePrintableCertificate(event, form, certificateConfig, language)

  const handleCorrection = () =>
    navigate(ROUTES.V2.EVENTS.OVERVIEW.buildPath({ eventId }))

  const handlePrint = async () => {
    const confirmed = await openModal<boolean>((close) => (
      <ResponsiveModal
        actions={[
          <Button
            key="close-modal"
            id="close-modal"
            type="tertiary"
            onClick={() => {
              close(false)
            }}
          >
            {intl.formatMessage(messages.cancel)}
          </Button>,
          <Button
            key="print-certificate"
            id="print-certificate"
            type="primary"
            onClick={() => close(true)}
          >
            {intl.formatMessage(messages.print)}
          </Button>
        ]}
        contentHeight={100}
        handleClose={() => close(false)}
        id="confirm-print-modal"
        show={true}
        title={intl.formatMessage(
          isPrintInAdvance
            ? messages.printModalTitle
            : messages.printAndIssueModalTitle
        )}
      >
        {intl.formatMessage(
          isPrintInAdvance
            ? messages.printModalBody
            : messages.printAndIssueModalBody
        )}
      </ResponsiveModal>
    ))

    if (confirmed) {
      handleCertify?.()
      events.actions.printCertificate.mutate({
        eventId: event.id,
        data: form,
        transactionId: uuid(),
        type: ActionType.PRINT_CERTIFICATE
      })
      clear()
      navigate(ROUTES.V2.EVENTS.OVERVIEW.buildPath({ eventId }))
    }
  }

  if (!svgCode || !templateId) {
    return <Spinner id="review-certificate-loading" />
  }

  return (
    <FormLayout
      action={ActionType.PRINT_CERTIFICATE}
      route={ROUTES.V2.EVENTS.PRINT_CERTIFICATE}
    >
      <Frame.LayoutCentered>
        <Stack direction="column">
          <Box>
            <CertificateContainer
              dangerouslySetInnerHTML={{ __html: svgCode }}
              id="print"
            />
          </Box>
          <Content
            bottomActionButtons={[
              canUserEditRecord ? (
                <Button
                  key="edit-record"
                  fullWidth
                  size="large"
                  type="negative"
                  onClick={handleCorrection}
                >
                  <Icon name="X" size="medium" />
                  {intl.formatMessage(messages.makeCorrection)}
                </Button>
              ) : (
                <></>
              ),

              <Button
                key="confirm-and-print"
                fullWidth
                id="confirm-print"
                size="large"
                type="positive"
                onClick={handlePrint}
              >
                <Icon name="Check" size="medium" />
                {intl.formatMessage(messages.confirmPrint)}
              </Button>
            ]}
            bottomActionDirection="row"
            title={intl.formatMessage(messages.printTitle)}
          >
            {modal}
            {intl.formatMessage(messages.printDescription)}
          </Content>
        </Stack>
      </Frame.LayoutCentered>
    </FormLayout>
  )
}
