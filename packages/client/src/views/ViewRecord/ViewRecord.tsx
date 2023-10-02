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
import {
  createReviewDeclaration,
  IDeclaration,
  IDuplicates,
  SUBMISSION_STATUS
} from '@client/declarations'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'
import { useQuery } from '@apollo/client'
import { IFormData } from '@client/forms'
import { goBack } from '@client/navigation'
import { Event, FetchViewRecordByCompositionQuery } from '@client/utils/gateway'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@opencrvs/components/lib/Button'
import { getOfflineData } from '@client/offline/selectors'
import { gqlToDraftTransformer } from '@client/transformer'
import { AppBar, Frame, Icon, Spinner } from '@opencrvs/components'
import { messages } from '@client/i18n/messages/views/review'
import { DeclarationIcon, Duplicate } from '@opencrvs/components/lib/icons'
import { getUserDetails } from '@client/profile/profileSelectors'
import { STATUSTOCOLOR } from '@client/views/RecordAudit/RecordAudit'
import { getReviewForm } from '@client/forms/register/review-selectors'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { ReviewSection } from '@client/views/RegisterForm/review/ReviewSection'
import { FETCH_VIEW_RECORD_BY_COMPOSITION } from '@client/views/ViewRecord/query'

const Container = styled.div`
  height: 100%;
  padding: 30px;
  display: flex;
  flex: 1;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column;
  }
`

const FormPreview = styled.div`
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

const DocumentPreview = styled.div`
  height: 90%;
  width: 40%;
  border-radius: 4px;
  margin-left: 24px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const SpinnerWrapper = styled.div`
  padding: 10px;
`

const getDeclarationIconColor = (declaration: IDeclaration): string => {
  return declaration.submissionStatus === SUBMISSION_STATUS.DRAFT
    ? 'purple'
    : declaration.registrationStatus
    ? STATUSTOCOLOR[declaration.registrationStatus]
    : 'orange'
}

const LoadingState = () => {
  const intl = useIntl()
  const dispatch = useDispatch()
  return (
    <Frame
      header={
        <AppBar
          desktopRight={
            <Button
              type="secondary"
              size="small"
              onClick={() => dispatch(goBack())}
            >
              <Icon name="X" />
              {intl.formatMessage(buttonMessages.exitButton)}
            </Button>
          }
          mobileRight={
            <Button type="icon" size="small" onClick={() => dispatch(goBack())}>
              <Icon name="X" />
            </Button>
          }
        />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Container>
        <FormPreview>
          <SpinnerWrapper>
            <Spinner id={'view-record-spinner'} size={24} />
          </SpinnerWrapper>
        </FormPreview>
        <DocumentPreview></DocumentPreview>
      </Container>
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

  const { loading, error, data } = useQuery<FetchViewRecordByCompositionQuery>(
    FETCH_VIEW_RECORD_BY_COMPOSITION,
    {
      variables: { id: declarationId },
      fetchPolicy: 'network-only'
    }
  )

  if (loading) return <LoadingState />

  if (error) return <GenericErrorToast />

  const eventData = data?.fetchRegistrationForViewing
  const eventType = ((data?.fetchRegistrationForViewing?.registration?.type &&
    data.fetchRegistrationForViewing.registration.type.toLowerCase()) ||
    '') as Event

  const transData: IFormData = gqlToDraftTransformer(
    form[eventType],
    data?.fetchRegistrationForViewing,
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
  const headerTitle = intl.formatMessage(messages.headerSubjectWithoutName, {
    eventType: eventType
  })
  const iconColor = getDeclarationIconColor(declaration)
  const isDuplicate =
    (
      data?.fetchRegistrationForViewing?.registration
        ?.duplicates as IDuplicates[]
    )?.length > 0

  return (
    <Frame
      header={
        <AppBar
          desktopTitle={headerTitle}
          desktopLeft={
            isDuplicate ? <Duplicate /> : <DeclarationIcon color={iconColor} />
          }
          desktopRight={
            <Button
              type="secondary"
              size="small"
              onClick={() => dispatch(goBack())}
            >
              <Icon name="X" />
              {intl.formatMessage(buttonMessages.exitButton)}
            </Button>
          }
          mobileTitle={headerTitle}
          mobileLeft={
            isDuplicate ? <Duplicate /> : <DeclarationIcon color={iconColor} />
          }
          mobileRight={
            <Button type="icon" size="small" onClick={() => dispatch(goBack())}>
              <Icon name="X" />
            </Button>
          }
        />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <ReviewSection
        viewRecord
        submitClickEvent={() => {}}
        pageRoute={''}
        draft={declaration}
      />
    </Frame>
  )
}
