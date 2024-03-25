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
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
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
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router'
import { getPDFTemplateWithSVG, printCertificate } from './PDFUtils'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { useIntl } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { hasRegisterScope } from '@client/utils/authUtils'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import {
  goToCertificateCorrection,
  goToHomeTab,
  goBack
} from '@client/navigation'
import { Event } from '@client/utils/gateway'
import { CorrectionSection, SubmissionAction } from '@client/forms'
import { useModal } from '@client/hooks/useModal'
import {
  isCertificateForPrintInAdvance,
  getRegisteredDate,
  getEventDate,
  isFreeOfCost,
  calculatePrice,
  getCountryTranslations
} from './utils'
import {
  IPrintableDeclaration,
  modifyDeclaration,
  SUBMISSION_STATUS,
  writeDeclaration
} from '@client/declarations'
import { cloneDeep } from 'lodash'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import styled from 'styled-components'
import { useDeclaration } from '@client/declarations/selectors'
import { countries } from '@client/utils/countries'

const CertificateContainer = styled.div``

export const ReviewCertificate = () => {
  const offlineData = useSelector(getOfflineData)
  const location = useLocation<{ isNavigatedInsideApp: boolean }>()
  const [svg, setSvg] = useState<string>()

  const { registrationId } = useParams<{ registrationId: string }>()
  const declaration = useDeclaration<IPrintableDeclaration>(registrationId)
  const dispatch = useDispatch()
  const state = useSelector((store: IStoreState) => store)
  const intl = useIntl()
  const scope = useSelector((store: IStoreState) => getScope(store))
  const [modal, openModal] = useModal()
  const userDetails = useSelector((store: IStoreState) => getUserDetails(store))
  const languages = useSelector((store: IStoreState) =>
    getCountryTranslations(store.i18n.languages, countries)
  )

  useEffect(() => {
    if (declaration)
      getPDFTemplateWithSVG(offlineData, declaration, 'A4', state).then((svg) =>
        setSvg(svg.svgCode)
      )
  }, [offlineData, declaration, registrationId, state])

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

  if (!declaration || !svg) {
    return (
      <Frame
        header={
          <AppBar
            desktopLeft={
              <Button type="icon">
                <Icon name="CaretLeft" size="large" />
              </Button>
            }
          />
        }
        skipToContentText="Skip to main content"
      >
        <Frame.LayoutCentered>
          <Spinner id="review-certificate-loading" />
        </Frame.LayoutCentered>
      </Frame>
    )
  }

  const isPrintInAdvanced = isCertificateForPrintInAdvance(declaration)

  const readyToCertifyAndIssueOrCertify = () => {
    const draft = cloneDeep(declaration) as IPrintableDeclaration

    draft.submissionStatus = SUBMISSION_STATUS.READY_TO_CERTIFY
    draft.action = isPrintInAdvanced
      ? SubmissionAction.CERTIFY_DECLARATION
      : SubmissionAction.CERTIFY_AND_ISSUE_DECLARATION

    const registeredDate = getRegisteredDate(draft.data)
    const certificate = draft.data.registration.certificates[0]
    const eventDate = getEventDate(draft.data, draft.event)
    if (!isPrintInAdvanced) {
      if (isFreeOfCost(draft.event, eventDate, registeredDate, offlineData)) {
        certificate.payments = {
          type: 'MANUAL' as const,
          amount: 0,
          outcome: 'COMPLETED' as const,
          date: new Date().toISOString()
        }
      } else {
        const paymentAmount = calculatePrice(
          draft.event,
          eventDate,
          registeredDate,
          offlineData
        )
        certificate.payments = {
          type: 'MANUAL' as const,
          amount: Number(paymentAmount),
          outcome: 'COMPLETED' as const,
          date: new Date().toISOString()
        }
      }
    }

    draft.data.registration = {
      ...draft.data.registration,
      certificates: [
        {
          ...certificate,
          data: svg || ''
        }
      ]
    }

    printCertificate(intl, draft, userDetails, offlineData, state, languages)

    dispatch(modifyDeclaration(draft))
    dispatch(writeDeclaration(draft))
    dispatch(goToHomeTab(WORKQUEUE_TABS.readyToPrint))
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
            onClick={readyToCertifyAndIssueOrCertify}
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
      readyToCertifyAndIssueOrCertify()
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
      skipToContentText="Skip to main content"
    >
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

                declaration.event !== Event.Marriage &&
                hasRegisterScope(scope) ? (
                  <Button
                    key="edit-record"
                    type="negative"
                    onClick={() =>
                      dispatch(
                        goToCertificateCorrection(
                          registrationId,
                          CorrectionSection.Corrector
                        )
                      )
                    }
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
    </Frame>
  )
}
