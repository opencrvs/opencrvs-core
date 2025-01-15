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
import { defineMessages } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { getCurrentEventState, ActionType } from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { FormLayout } from '@client/v2-events/layouts/form'
import { usePrintableCertificate } from '@client/v2-events/hooks/usePrintableCertificate'
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
import { api } from '@client/v2-events/trpc'

const CertificateContainer = styled.div`
  svg {
    /* limits the certificate overflowing on small screens */
    max-width: 100%;
  }
`
const messages = defineMessages({
  registerActionTitle: {
    id: 'registerAction.title',
    defaultMessage: 'Register member',
    description: 'The title for register action'
  },
  registerActionDescription: {
    id: 'registerAction.description',
    defaultMessage:
      'By clicking register, you confirm that the information entered is correct and the member can be registered.',
    description: 'The description for register action'
  },
  registerActionDeclare: {
    id: 'registerAction.Declare',
    defaultMessage: 'Register',
    description: 'The label for declare button of register action'
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
 * Preview of event to be registered.
 */
export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.COLLECT_CERTIFICATE)
  const intl = useIntl()
  const events = useEvents()
  const [modal, openModal] = useModal()
  const navigate = useNavigate()
  const { goToHome } = useEventFormNavigation()
  const collectCertificateMutation = events.actions.collectCertificate

  const [event] = events.getEvent.useSuspenseQuery(eventId)
  const { eventConfiguration: config } = useEventConfiguration(event.type)

  if (!config) {
    throw new Error('Event configuration not found with type: ' + event.type)
  }

  const { forms: formConfigs } = config.actions.filter(
    (action) => action.type === ActionType.COLLECT_CERTIFICATE
  )[0]

  const setFormValues = useEventFormData((state) => state.setFormValues)
  const getFormValues = useEventFormData((state) => state.getFormValues)

  // useEffect(() => {
  //   setFormValues(eventId, getCurrentEventState(event).data)
  // }, [event, eventId, setFormValues])

  const form = getFormValues(eventId)
  console.trace(form)

  const {
    isLoadingInProgress,
    svgCode,
    handleCertify,
    isPrintInAdvance,
    canUserEditRecord
  } = usePrintableCertificate(form)

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

  async function handleRegistration() {
    const confirmedRegistration = await openModal<boolean | null>((close) => (
      <ReviewComponent.ActionModal action="Collect Certificate" close={close} />
    ))
    if (confirmedRegistration) {
      collectCertificateMutation.mutate({
        eventId: event.id,
        data: form,
        transactionId: uuid()
      })

      goToHome()
    }
  }
  const confirmAndPrint = async () => {
    const saveAndExitConfirm = await openModal<boolean>((close) => (
      <ResponsiveModal
        id="confirm-print-modal"
        title={
          isPrintInAdvance
            ? intl.formatMessage(messages.printModalTitle)
            : intl.formatMessage(messages.printAndIssueModalTitle)
        }
        actions={[
          <Button
            type="tertiary"
            key="close-modal"
            onClick={() => {
              close(false)
            }}
            id="close-modal"
          >
            {intl.formatMessage(messages.cancel)}
          </Button>,
          <Button
            type="primary"
            key="print-certificate"
            onClick={() => close(true)}
            id="print-certificate"
          >
            {intl.formatMessage(messages.print)}
          </Button>
        ]}
        show={true}
        handleClose={() => close(false)}
        contentHeight={100}
      >
        {isPrintInAdvance
          ? intl.formatMessage(messages.printModalBody)
          : intl.formatMessage(messages.printAndIssueModalBody)}
      </ResponsiveModal>
    ))

    if (saveAndExitConfirm) {
      handleCertify()
    }
  }

  if (!isLoadingInProgress) {
    return <Spinner id="review-certificate-loading" />
  }

  return (
    <FormLayout
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
              id="print"
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />
          </Box>
          <Content
            title={intl.formatMessage(messages.registerActionTitle)}
            bottomActionDirection="row"
            bottomActionButtons={[
              canUserEditRecord ? (
                <Button
                  key="edit-record"
                  type="negative"
                  onClick={() =>
                    handleEdit({
                      pageId: formConfigs[0].pages[0].id,
                      fieldId: undefined
                    })
                  }
                  size="large"
                  fullWidth
                >
                  <Icon name="X" size="medium" />
                  {intl.formatMessage(messages.registerActionDeclare)}
                </Button>
              ) : (
                <></>
              ),

              <Button
                key="confirm-and-print"
                type="positive"
                id="confirm-print"
                onClick={confirmAndPrint}
                size="large"
                fullWidth
              >
                <Icon name="Check" size="medium" />
                {intl.formatMessage(messages.confirmAndPrint)}
              </Button>
            ]}
          >
            {intl.formatMessage(messages.reviewDescription)}
          </Content>
        </Stack>
      </Frame.LayoutCentered>
      {/* <ReviewComponent.Body
        eventConfig={config}
        form={form}
        formConfig={formConfigs[0]}
        title=""
        onEdit={handleEdit}
      >
        <ReviewComponent.Actions
          messages={{
            title: messages.registerActionTitle,
            description: messages.registerActionDescription,
            onConfirm: messages.registerActionDeclare
          }}
          onConfirm={handleRegistration}
        />
        {modal}
      </ReviewComponent.Body> */}
      {/* <ReviewCertificate /> */}
    </FormLayout>
  )
}
