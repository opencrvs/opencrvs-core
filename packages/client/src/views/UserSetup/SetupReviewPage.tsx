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
import * as React from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  ActionPageLight,
  DataRow,
  IDataProps,
  Loader
} from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { WarningMessage } from '@opencrvs/components/lib/forms'
import {
  ProtectedAccoutStep,
  IProtectedAccountSetupData,
  ISecurityQuestionAnswer
} from '@client/components/ProtectedAccount'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { createNamesMap } from '@client/utils/data-formatting'
import { getUserName, IUserDetails } from '@client/utils/userUtils'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { Mutation } from 'react-apollo'
import {
  userMessages,
  buttonMessages,
  constantsMessages,
  errorMessages
} from '@client/i18n/messages'
import { Check } from '@opencrvs/components/lib/icons'
import { activateUserMutation } from '@client/views/UserSetup/queries'
import { messages } from '@client/i18n/messages/views/userSetup'
import { Content } from '@opencrvs/components/lib/interface/Content'
import {
  SubmitActivateUserMutation,
  SubmitActivateUserMutationVariables
} from '@client/utils/gateway'

const GlobalError = styled.div`
  color: ${({ theme }) => theme.colors.negative};
`

const ConfirmButton = styled(PrimaryButton)`
  & svg {
    margin-right: 16px;
  }
`

const LoaderOverlay = styled.div`
  background: ${({ theme }) => theme.colors.white};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`
interface IProps {
  setupData: IProtectedAccountSetupData
  goToStep: (
    step: ProtectedAccoutStep,
    data: IProtectedAccountSetupData
  ) => void
}

export function UserSetupReview({ setupData, goToStep }: IProps) {
  const intl = useIntl()
  const [submitError, setSubmitError] = React.useState(false)
  const userDetails = useSelector<IStoreState, IUserDetails | null>(
    getUserDetails
  )
  const englishName = getUserName(userDetails)
  const mobile = (userDetails && (userDetails.mobile as string)) || ''

  const typeRole =
    (userDetails &&
      userDetails.role &&
      (userDetails.type
        ? `${intl.formatMessage(
            userMessages[userDetails.role as string]
          )} / ${intl.formatMessage(userMessages[userDetails.type as string])}`
        : `${intl.formatMessage(userMessages[userDetails.role as string])}`)) ||
    ''

  const primaryOffice =
    (userDetails &&
      userDetails.primaryOffice &&
      userDetails.primaryOffice.name) ||
    ''

  const answeredQuestions: IDataProps[] = []
  setupData.securityQuestionAnswers &&
    setupData.securityQuestionAnswers.forEach((e) => {
      answeredQuestions.push({
        id: `Question_${e.questionKey}`,
        label: intl.formatMessage(userMessages[e.questionKey]),
        value: e.answer,
        action: {
          id: `Question_Action_${e.questionKey}`,
          label: intl.formatMessage(buttonMessages.change),
          handler: () =>
            goToStep(ProtectedAccoutStep.SECURITY_QUESTION, setupData)
        }
      })
    })
  const items = [
    {
      id: 'EnglishName',
      label: intl.formatMessage(messages.labelEnglishName),
      value: englishName,
      action: {
        label: intl.formatMessage(buttonMessages.change),
        disabled: true
      }
    },
    {
      id: 'UserPhone',
      label: intl.formatMessage(constantsMessages.labelPhone),
      value: mobile,
      action: {
        label: intl.formatMessage(buttonMessages.change),
        disabled: true
      }
    },
    {
      id: 'RegisterOffice',
      label: intl.formatMessage(messages.labelAssignedOffice),
      value: primaryOffice
    },
    {
      id: 'RoleType',
      label: `${intl.formatMessage(
        constantsMessages.labelRole
      )} / ${intl.formatMessage(constantsMessages.type)}`,
      value: typeRole
    },
    ...answeredQuestions
  ]

  const onCompleted = () => {
    goToStep(ProtectedAccoutStep.CONFIRMATION, setupData)
  }
  const onError = () => {
    setSubmitError(true)
  }
  const confirmActionButton = (
    <Mutation<SubmitActivateUserMutation, SubmitActivateUserMutationVariables>
      mutation={activateUserMutation}
      variables={{
        userId: String(setupData.userId),
        password: String(setupData.password),
        securityQuestionAnswers:
          setupData.securityQuestionAnswers as ISecurityQuestionAnswer[]
      }}
      onCompleted={() => onCompleted()}
      onError={() => onError()}
    >
      {(submitActivateUser, { loading }) => {
        if (loading) {
          return (
            <LoaderOverlay>
              <Loader
                id="setup_submit_waiting"
                loadingText={intl.formatMessage(messages.waiting)}
              />
            </LoaderOverlay>
          )
        }
        return (
          <ConfirmButton id="Confirm" onClick={() => submitActivateUser()}>
            <Check />
            {intl.formatMessage(buttonMessages.confirm)}
          </ConfirmButton>
        )
      }}
    </Mutation>
  )
  return (
    <ActionPageLight
      title={intl.formatMessage(messages.userSetupRevieTitle)}
      hideBackground
      goBack={() => {
        goToStep(ProtectedAccoutStep.SECURITY_QUESTION, setupData)
      }}
    >
      <Content
        title={intl.formatMessage(messages.userSetupReviewHeader)}
        bottomActionButtons={[confirmActionButton]}
      >
        <GlobalError id="GlobalError">
          {submitError && (
            <WarningMessage>
              {intl.formatMessage(errorMessages.pleaseTryAgainError)}
            </WarningMessage>
          )}
        </GlobalError>
        <div id="UserSetupData">
          {items.map((item: IDataProps, index: number) => (
            <DataRow key={index} {...item} />
          ))}
        </div>
      </Content>
    </ActionPageLight>
  )
}
