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
import * as React from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { DataRow, IDataProps } from '@opencrvs/components/lib/ViewData'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Loader } from '@opencrvs/components/lib/Loader'
import {
  ProtectedAccoutStep,
  IProtectedAccountSetupData,
  ISecurityQuestionAnswer
} from '@client/components/ProtectedAccount'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { getUserName, UserDetails } from '@client/utils/userUtils'
import {
  SubmitActivateUserMutation,
  SubmitActivateUserMutationVariables
} from '@client/utils/gateway'
import { Mutation } from '@apollo/client/react/components'
import {
  userMessages,
  buttonMessages,
  constantsMessages,
  errorMessages
} from '@client/i18n/messages'
import { Check } from '@opencrvs/components/lib/icons'
import { activateUserMutation } from '@client/views/UserSetup/queries'
import { messages } from '@client/i18n/messages/views/userSetup'
import { Content } from '@opencrvs/components/lib/Content'
import { getUserRole } from '@client/views/SysAdmin/Config/UserRoles/utils'
import { getLanguage } from '@client/i18n/selectors'
import { ErrorText } from '@opencrvs/components/lib/'

const GlobalError = styled.div`
  color: ${({ theme }) => theme.colors.negative};
`

const ConfirmButton = styled(PrimaryButton)`
  & svg {
    margin-right: 16px;
  }
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
  const userDetails = useSelector<IStoreState, UserDetails | null>(
    getUserDetails
  )
  const englishName = getUserName(userDetails)
  const mobile = (userDetails && (userDetails.mobile as string)) || ''
  const email = (userDetails && (userDetails.email as string)) || ''
  const language = useSelector(getLanguage)
  const role = userDetails && getUserRole(language, userDetails.role)
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
      id: 'Email',
      label: intl.formatMessage(constantsMessages.labelEmail),
      value: email,
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
      id: 'Role',
      label: `${intl.formatMessage(constantsMessages.labelRole)}`,
      value: role
    },
    ...answeredQuestions
  ]

  const onCompleted = () => {
    goToStep(ProtectedAccoutStep.CONFIRMATION, setupData)
  }
  const onError = () => {
    setSubmitError(true)
  }
  return (
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
        return (
          <ActionPageLight
            title={intl.formatMessage(messages.userSetupRevieTitle)}
            hideBackground
            goBack={() => {
              goToStep(ProtectedAccoutStep.SECURITY_QUESTION, setupData)
            }}
          >
            {loading ? (
              <Content>
                <Loader
                  id="setup_submit_waiting"
                  loadingText={intl.formatMessage(messages.waiting)}
                />
              </Content>
            ) : (
              <Content
                title={intl.formatMessage(messages.userSetupReviewHeader)}
                bottomActionButtons={[
                  <ConfirmButton
                    key="confirm"
                    id="Confirm"
                    onClick={() => submitActivateUser()}
                  >
                    <Check />
                    {intl.formatMessage(buttonMessages.confirm)}
                  </ConfirmButton>
                ]}
              >
                <GlobalError id="GlobalError">
                  {submitError && (
                    <ErrorText>
                      {intl.formatMessage(errorMessages.pleaseTryAgainError)}
                    </ErrorText>
                  )}
                </GlobalError>
                <div id="UserSetupData">
                  {items.map((item: IDataProps, index: number) => (
                    <DataRow key={index} {...item} />
                  ))}
                </div>
              </Content>
            )}
          </ActionPageLight>
        )
      }}
    </Mutation>
  )
}
