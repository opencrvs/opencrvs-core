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

import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Navigate, useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import styled from 'styled-components'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import ReactTooltip from 'react-tooltip'
import {
  ActionType,
  EventConfig,
  getOrThrow,
  getAcceptedActions,
  SCOPES
} from '@opencrvs/commons/client'
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
import { Print } from '@opencrvs/components/lib/icons'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useModal } from '@client/v2-events/hooks/useModal'
import { FormLayout } from '@client/v2-events/layouts'
import { usePrintableCertificate } from '@client/v2-events/hooks/usePrintableCertificate'
import { useAppConfig } from '@client/v2-events/hooks/useAppConfig'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { getUserIdsFromActions } from '@client/v2-events/utils'
import ProtectedComponent from '@client/components/ProtectedComponent'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useOnlineStatus } from '@client/utils'
import { useNotAssignedErrorToast } from '@client/v2-events/features/events/actions/useNotAssignedErrorToast'

const CertificateContainer = styled.div`
  svg {
    /* limits the certificate overflowing on small screens */
    max-width: 100%;
  }
`

const TooltipContainer = styled.div`
  width: 100%;
`

const TooltipMessage = styled.p`
  ${({ theme }) => theme.fonts.reg19};
  max-width: 200px;
`
const messages = defineMessages({
  printTitle: {
    id: 'v2.printAction.title',
    defaultMessage: 'Print certificate',
    description: 'The title for print action'
  },
  printDescription: {
    id: 'v2.printAction.description',
    defaultMessage:
      'Please confirm that the informant has reviewed that the information on the certificate is correct and that it is ready to print.',
    description: 'The description for print action'
  },
  printModalTitle: {
    id: 'v2.print.certificate.review.printModalTitle',
    defaultMessage: 'Print certificate?',
    description: 'Print certificate modal title text'
  },
  printAndIssueModalTitle: {
    id: 'v2.print.certificate.review.printAndIssueModalTitle',
    defaultMessage: 'Print and issue certificate?',
    description: 'Print and issue certificate modal title text'
  },
  printModalBody: {
    id: 'v2.print.certificate.review.modal.body.print',
    defaultMessage:
      'A Pdf of the certificate will open in a new tab for printing. The record will move to the ready-to-issue queue.',
    description: 'Print certificate modal body text'
  },
  printAndIssueModalBody: {
    id: 'v2.print.certificate.review.modal.body.printAndIssue',
    defaultMessage:
      'A Pdf of the certificate will open in a new tab for printing and issuing.',
    description: 'Print certificate modal body text'
  },
  makeCorrection: {
    id: 'v2.print.certificate.button.makeCorrection',
    defaultMessage: 'No, make correction',
    description: 'The label for correction button of print action'
  },
  confirmPrint: {
    id: 'v2.print.certificate.button.confirmPrint',
    defaultMessage: 'Yes, print certificate',
    description: 'The text for print button'
  },
  cancel: {
    id: 'v2.buttons.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button text in the modal'
  },
  print: {
    id: 'v2.buttons.print',
    defaultMessage: 'Print',
    description: 'Print button text'
  },
  onlineOnly: {
    id: 'v2.print.certificate.onlineOnly',
    defaultMessage:
      'Print certificate is an online only action. Please go online to print the certificate',
    description: 'Print certificate online only message'
  }
})

function getPrintForm(configuration: EventConfig) {
  const actionConfig = configuration.actions.find(
    (a) => a.type === ActionType.PRINT_CERTIFICATE
  )

  return getOrThrow(
    actionConfig?.printForm,
    `No form found for action: ${ActionType.PRINT_CERTIFICATE}`
  )
}

export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.PRINT_CERTIFICATE.REVIEW)
  const [{ templateId }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.PRINT_CERTIFICATE.REVIEW
  )

  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()

  if (!templateId) {
    throw new Error('Please select a template from the previous step')
  }
  const intl = useIntl()
  const navigate = useNavigate()
  const isOnline = useOnlineStatus()
  const [modal, openModal] = useModal()

  const { getEvent, onlineActions } = useEvents()
  const [fullEvent] = getEvent.useSuspenseQuery(eventId)

  const actions = getAcceptedActions(fullEvent)
  const userIds = getUserIdsFromActions(actions)
  const { getUsers } = useUsers()
  const [users] = getUsers.useSuspenseQuery(userIds)

  const { onPossibleNotAssignedError, NotAssignedErrorToast } =
    useNotAssignedErrorToast(fullEvent.trackingId)

  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()

  const { certificateTemplates, language } = useAppConfig()
  const certificateConfig = certificateTemplates.find(
    (template) => template.id === templateId
  )
  const { eventConfiguration } = useEventConfiguration(fullEvent.type)
  const formConfig = getPrintForm(eventConfiguration)

  const { svgCode, handleCertify } = usePrintableCertificate({
    event: fullEvent,
    config: eventConfiguration,
    locations,
    users,
    certificateConfig,
    language
  })

  /**
   * If there are validation errors in the form, redirect to the
   * print certificate form page, since the user should not be able to
   * review/print the certificate if there are validation errors.
   */
  const validationErrorExist = validationErrorsInActionFormExist({
    formConfig,
    form: annotation
  })

  if (validationErrorExist) {
    // eslint-disable-next-line no-console
    console.warn('Form is not properly filled. Redirecting to the beginning...')
    return (
      <Navigate
        to={ROUTES.V2.EVENTS.PRINT_CERTIFICATE.buildPath({ eventId })}
      />
    )
  }

  if (!svgCode) {
    return <Spinner id="review-certificate-loading" />
  }

  const handleCorrection = () =>
    navigate(ROUTES.V2.EVENTS.REQUEST_CORRECTION.buildPath({ eventId }))

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
        title={intl.formatMessage(messages.printAndIssueModalTitle)}
      >
        {intl.formatMessage(messages.printAndIssueModalBody)}
      </ResponsiveModal>
    ))

    if (confirmed) {
      try {
        await onlineActions.printCertificate.mutateAsync({
          fullEvent,
          eventId: fullEvent.id,
          declaration: {},
          annotation: { ...annotation, templateId },
          transactionId: uuid(),
          type: ActionType.PRINT_CERTIFICATE
        })

        await handleCertify(fullEvent)
        navigate(ROUTES.V2.EVENTS.OVERVIEW.buildPath({ eventId }))
      } catch (e) {
        onPossibleNotAssignedError(e)
        // TODO: add notification alert
        // eslint-disable-next-line no-console
        console.error(e)
      }
    }
  }

  return (
    <FormLayout
      appbarIcon={<Print />}
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

          {!isOnline && (
            <ReactTooltip effect="solid" id="no-connection" place="top">
              <TooltipMessage>
                {intl.formatMessage(messages.onlineOnly)}
              </TooltipMessage>
            </ReactTooltip>
          )}

          <NotAssignedErrorToast />

          <Content
            bottomActionButtons={[
              <ProtectedComponent
                key="edit-record"
                scopes={[
                  SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION,
                  SCOPES.RECORD_REGISTRATION_CORRECT
                ]}
              >
                <Button
                  fullWidth
                  size="large"
                  type="negative"
                  onClick={handleCorrection}
                >
                  <Icon name="X" size="medium" />
                  {intl.formatMessage(messages.makeCorrection)}
                </Button>
              </ProtectedComponent>,
              <TooltipContainer
                key="confirm-and-print"
                data-tip
                data-for="no-connection"
              >
                <Button
                  fullWidth
                  disabled={!isOnline}
                  id="confirm-print"
                  size="large"
                  type="positive"
                  onClick={handlePrint}
                >
                  <Icon name="Check" size="medium" />
                  {intl.formatMessage(messages.confirmPrint)}
                </Button>
              </TooltipContainer>
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
