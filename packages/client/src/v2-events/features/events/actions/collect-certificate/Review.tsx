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
import { useTypedParams } from 'react-router-typesafe-routes/dom'
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
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { FormLayout } from '@client/v2-events/layouts/form'
import { usePrintableCertificate } from '@client/v2-events/hooks/usePrintableCertificate'
import { api } from '@client/v2-events/trpc'
import { useAppConfig } from '@client/v2-events/hooks/useAppConfig'

const CertificateContainer = styled.div`
  svg {
    /* limits the certificate overflowing on small screens */
    max-width: 100%;
  }
`
const messages = defineMessages({
  printActionTitle: {
    id: 'printAction.title',
    defaultMessage: 'Print certificate',
    description: 'The title for print action'
  },
  printActionDescription: {
    id: 'printAction.description',
    defaultMessage:
      'Please confirm that the informant has reviewed that the information on the certificate is correct and that it is ready to print.',
    description: 'The description for print action'
  },
  printActionDeclare: {
    id: 'printAction.Declare',
    defaultMessage: 'No, make correction',
    description: 'The label for declare button of print action'
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
      'A PDF of the certificate will open in a new tab for you to print. This record will then be moved to your ready to issue work-queue',
    description: 'Print certificate modal body text'
  },
  printAndIssueModalBody: {
    id: 'print.certificate.review.modal.body.printAndIssue',
    defaultMessage:
      'A PDF of the certificate will open in a new tab for you to print and issue',
    description: 'Print certificate modal body text'
  },
  confirmAndPrint: {
    defaultMessage: 'Yes, print certificate',
    description: 'The text for print button',
    id: 'print.certificate.button.confirmPrint'
  },
  reviewTitle: {
    defaultMessage: 'Ready to certify?',
    description: 'Certificate review title',
    id: 'print.certificate.review.title'
  },
  reviewDescription: {
    defaultMessage:
      'Please confirm that the informant has reviewed that the information on the certificate is correct and that it is ready to print.',
    description: 'Certificate review description',
    id: 'print.certificate.review.description'
  },
  cancel: {
    defaultMessage: 'Cancel',
    description: 'Cancel button text in the modal',
    id: 'buttons.cancel'
  },
  print: {
    defaultMessage: 'Print',
    description: 'Print button text',
    id: 'buttons.print'
  }
})

/**
 *
 * Preview of event to print certificate.
 */
export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.COLLECT_CERTIFICATE)
  const intl = useIntl()
  const events = useEvents()
  const [modal, openModal] = useModal()
  const navigate = useNavigate()
  const { goToHome } = useEventFormNavigation()
  const { appConfig, certificatesTemplate, language, initiateAppConfig } =
    useAppConfig()

  useEffect(() => {
    initiateAppConfig()
  }, [initiateAppConfig])

  const collectCertificateMutation = events.actions.collectCertificate

  const [event] = events.getEvent.useSuspenseQuery(eventId)
  const { eventConfiguration: config } = useEventConfiguration(event.type)

  if (!config) {
    throw new Error('Event configuration not found with type: ' + event.type)
  }

  const { forms: formConfigs } = config.actions.filter(
    (action) => action.type === ActionType.COLLECT_CERTIFICATE
  )[0]

  const getFormValues = useEventFormData((state) => state.getFormValues)
  const form = getFormValues(eventId)

  const { svgCode, handleCertify, isPrintInAdvance, canUserEditRecord } =
    usePrintableCertificate(form, appConfig, certificatesTemplate, language)

  async function handleEdit({
    pageId,
    fieldId
  }: {
    pageId: string
    fieldId?: string
  }) {
    const confirmedEdit = await openModal<boolean | null>((close) => (
      <ReviewComponent.EditModal close={close} />
    ))

    if (confirmedEdit) {
      navigate(
        ROUTES.V2.EVENTS.COLLECT_CERTIFICATE.PAGES.buildPath(
          { pageId, eventId },
          {
            from: 'review'
          },
          fieldId
        )
      )
    }
    return
  }

  const confirmAndPrint = async () => {
    const saveAndExitConfirm = await openModal<boolean>((close) => (
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
        title={
          isPrintInAdvance
            ? intl.formatMessage(messages.printModalTitle)
            : intl.formatMessage(messages.printAndIssueModalTitle)
        }
      >
        {isPrintInAdvance
          ? intl.formatMessage(messages.printModalBody)
          : intl.formatMessage(messages.printAndIssueModalBody)}
      </ResponsiveModal>
    ))

    if (saveAndExitConfirm) {
      handleCertify && handleCertify()
    }
  }

  if (!svgCode) {
    return <Spinner id="review-certificate-loading" />
  }

  return (
    <FormLayout
      action={ActionType.COLLECT_CERTIFICATE}
      route={ROUTES.V2.EVENTS.COLLECT_CERTIFICATE}
      onSaveAndExit={() => {
        events.actions.collectCertificate.mutate({
          eventId: event.id,
          data: form,
          transactionId: uuid(),
          draft: true
        })
        goToHome()
      }}
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
                  onClick={async () =>
                    handleEdit({
                      pageId: formConfigs[0].pages[0].id,
                      fieldId: undefined
                    })
                  }
                >
                  <Icon name="X" size="medium" />
                  {intl.formatMessage(messages.printActionDeclare)}
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
                onClick={confirmAndPrint}
              >
                <Icon name="Check" size="medium" />
                {intl.formatMessage(messages.confirmAndPrint)}
              </Button>
            ]}
            bottomActionDirection="row"
            title={intl.formatMessage(messages.printActionTitle)}
          >
            {modal}
            {intl.formatMessage(messages.reviewDescription)}
          </Content>
        </Stack>
      </Frame.LayoutCentered>
    </FormLayout>
  )
}
