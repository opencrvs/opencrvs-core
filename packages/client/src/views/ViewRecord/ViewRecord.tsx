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
import { AppBar, Frame } from '@opencrvs/components'
import { getOfflineData } from '@client/offline/selectors'
import { gqlToDraftTransformer } from '@client/transformer'
import { DeclarationIcon } from '@opencrvs/components/lib/icons'
import { getUserDetails } from '@client/profile/profileSelectors'
import { STATUSTOCOLOR } from '@client/views/RecordAudit/RecordAudit'
import { getReviewForm } from '@client/forms/register/review-selectors'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { ReviewSection } from '@client/views/RegisterForm/review/ReviewSection'
import { FETCH_VIEW_RECORD_BY_COMPOSITION } from '@client/views/ViewRecord/query'

const getDeclarationIconColor = (declaration: IDeclaration): string => {
  return declaration.submissionStatus === SUBMISSION_STATUS.DRAFT
    ? 'purple'
    : declaration.registrationStatus
    ? STATUSTOCOLOR[declaration.registrationStatus]
    : 'orange'
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

  if (loading) return <>Loading</>

  if (error) return <>Error</>

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
