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

import React from 'react'
import {
  IDeclaration,
  SUBMISSION_STATUS,
  createReviewDeclaration
} from '@client/declarations'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'
import { useQuery } from '@apollo/client'
import { IFormData } from '@client/forms'
import { goBack } from '@client/navigation'
import { Event } from '@client/utils/gateway'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@opencrvs/components/lib/Button'
import {
  Alert,
  AppBar,
  BodyContent,
  DocumentViewer,
  Frame,
  FullBodyContent,
  InputField,
  ListViewItemSimplified,
  ListViewSimplified,
  ResponsiveModal,
  Spinner,
  TextArea
} from '@opencrvs/components'
import { getOfflineData } from '@client/offline/selectors'
import { gqlToDraftTransformer } from '@client/transformer'
import { DeclarationIcon } from '@opencrvs/components/lib/icons'
import { getUserDetails } from '@client/profile/profileSelectors'
import { STATUSTOCOLOR } from '@client/views/RecordAudit/RecordAudit'
import { getReviewForm } from '@client/forms/register/review-selectors'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { ReviewSection } from '@client/views/RegisterForm/review/ReviewSection'
import { FETCH_VIEW_RECORD_BY_COMPOSITION } from '@client/views/ViewRecord/query'
import { Box } from '@opencrvs/components/lib/Box/Box'
import styled from '@client/styledComponents'
import { ReviewHeader } from '@client/views/RegisterForm/review/ReviewHeader'
import { messages } from '@client/i18n/messages/views/review'
import {
  LinkButton,
  PrimaryButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { DocumentListPreview } from '@client/components/form/DocumentUploadfield/DocumentListPreview'
import { bytesToSize, isCorrection } from '@client/views/CorrectionForm/utils'
import { ACCUMULATED_FILE_SIZE, REJECTED } from '@client/utils/constants'
import { DuplicateWarning } from '@client/views/Duplicates/DuplicateWarning'
import { ReviewAction } from '@client/components/form/ReviewActionComponent'
import { DocumentPreview } from '@client/components/form/DocumentUploadfield/DocumentPreview'
import { GenericErrorToast } from '@client/components/GenericErrorToast'

const getDeclarationIconColor = (declaration: IDeclaration): string => {
  return declaration.submissionStatus === SUBMISSION_STATUS.DRAFT
    ? 'purple'
    : declaration.registrationStatus
    ? STATUSTOCOLOR[declaration.registrationStatus]
    : 'orange'
}

const Row = styled.div`
  height: 100%;
  margin-top: 20px;
  padding: 30px;
  display: flex;
  flex: 1;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column;
  }
`
const RightColumn = styled.div`
  width: 40%;
  height: 90%;
  border-radius: 4px;
  margin-left: 24px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const LeftColumn = styled.div`
  width: 60%;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.grey300};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
    margin-bottom: 0px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    border: 0;
  }
`
const SpinnerWrapper = styled.div`
  padding: 10px;
`
const LoadingState = () => {
  const intl = useIntl()
  const dispatch = useDispatch()
  return (
    <Frame
      header={
        <AppBar
          desktopRight={
            <Button
              size="large"
              type="tertiary"
              onClick={() => dispatch(goBack())}
            >
              {intl.formatMessage(buttonMessages.exitButton)}
            </Button>
          }
          mobileRight={
            <Button
              size="large"
              type="tertiary"
              onClick={() => dispatch(goBack())}
            >
              {intl.formatMessage(buttonMessages.exitButton)}
            </Button>
          }
        />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Row>
        <LeftColumn>
          <SpinnerWrapper>
            <Spinner id={'view-record-spinner'} size={24} />
          </SpinnerWrapper>
        </LeftColumn>
        <RightColumn></RightColumn>
      </Row>
    </Frame>
  )
}

export const ViewRecord = () => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const form = useSelector(getReviewForm)
  const userDetails = useSelector(getUserDetails)
  const offlineData = useSelector(getOfflineData)
  const { declarationId } = useParams<{ declarationId: string }>()

  const { loading, error, data } = useQuery(FETCH_VIEW_RECORD_BY_COMPOSITION, {
    variables: { id: declarationId }
  })

  if (loading) return <LoadingState />

  if (error) return <GenericErrorToast />

  const eventType =
    data?.fetchRegistration?.__typename === 'BirthRegistration'
      ? Event.Birth
      : Event.Death
  const eventData = data?.fetchRegistration
  const transData: IFormData = gqlToDraftTransformer(
    form[eventType],
    data?.fetchRegistration,
    offlineData,
    userDetails!
  )
  const downloadedAppStatus: string =
    (eventData &&
      eventData.registration &&
      eventData.registration.status &&
      eventData?.registration?.status[0]?.type) ||
    ''
  const declaration = createReviewDeclaration(
    declarationId,
    transData,
    eventType,
    downloadedAppStatus
  )
  const declarationType = declaration?.event === Event.Death ? 'Death' : 'Birth'
  const headerTitle = declarationType + ' declaration'
  const iconColor = getDeclarationIconColor(declaration)

  return (
    <Frame
      header={
        <AppBar
          desktopTitle={headerTitle}
          desktopLeft={<DeclarationIcon color={iconColor} />}
          desktopRight={
            <Button
              size="large"
              type="tertiary"
              onClick={() => dispatch(goBack())}
            >
              {intl.formatMessage(buttonMessages.exitButton)}
            </Button>
          }
          mobileTitle={headerTitle}
          mobileLeft={<DeclarationIcon color={iconColor} />}
          mobileRight={
            <Button
              size="large"
              type="tertiary"
              onClick={() => dispatch(goBack())}
            >
              {intl.formatMessage(buttonMessages.exitButton)}
            </Button>
          }
        />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <ReviewSection
        submitClickEvent={() => {}}
        pageRoute={''}
        draft={declaration}
      />
    </Frame>
  )
}
