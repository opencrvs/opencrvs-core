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
import { connect } from 'react-redux'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
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
  IProtectedAccountSetupData
} from '@client/components/ProtectedAccount'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { createNamesMap } from '@client/utils/data-formatting'
import { IUserDetails } from '@client/utils/userUtils'
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

const Header = styled.h4`
  ${({ theme }) => theme.fonts.h2};
  color: ${({ theme }) => theme.colors.black};
`
const Instruction = styled.p`
  color: ${({ theme }) => theme.colors.copy};
`
const Action = styled.div`
  margin-top: 32px;
`

const GlobalError = styled.div`
  color: ${({ theme }) => theme.colors.error};
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

interface IState {
  submitError: boolean
}

interface IProps {
  setupData: IProtectedAccountSetupData
  userDetails: IUserDetails | null
  goToStep: (
    step: ProtectedAccoutStep,
    data: IProtectedAccountSetupData
  ) => void
}

type IFullProps = IProps & IntlShapeProps

class UserSetupReviewComponent extends React.Component<IFullProps, IState> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      submitError: false
    }
  }

  render = () => {
    const { intl, userDetails } = this.props

    const englishName =
      (userDetails &&
        userDetails.name &&
        (createNamesMap(userDetails.name as GQLHumanName[])['en'] as string)) ||
      ''
    const bengaliName =
      (userDetails &&
        userDetails.name &&
        (createNamesMap(userDetails.name as GQLHumanName[])['bn'] as string)) ||
      ''

    const mobile = (userDetails && (userDetails.mobile as string)) || ''

    const typeRole =
      (userDetails &&
        userDetails.role &&
        (userDetails.type
          ? `${intl.formatMessage(
              userMessages[userDetails.role as string]
            )} / ${intl.formatMessage(
              userMessages[userDetails.type as string]
            )}`
          : `${intl.formatMessage(
              userMessages[userDetails.role as string]
            )}`)) ||
      ''

    const primaryOffice =
      (userDetails &&
        userDetails.primaryOffice &&
        userDetails.primaryOffice.name) ||
      ''

    const answeredQuestions: IDataProps[] = []
    this.props.setupData.securityQuestionAnswers &&
      this.props.setupData.securityQuestionAnswers.forEach((e) => {
        answeredQuestions.push({
          id: `Question_${e.questionKey}`,
          label: intl.formatMessage(userMessages[e.questionKey]),
          value: e.answer,
          action: {
            id: `Question_Action_${e.questionKey}`,
            label: intl.formatMessage(buttonMessages.change),
            handler: () =>
              this.props.goToStep(
                ProtectedAccoutStep.SECURITY_QUESTION,
                this.props.setupData
              )
          }
        })
      })
    const items = [
      {
        id: 'BengaliName',
        label: intl.formatMessage(messages.labelBanglaName),
        value: bengaliName,
        action: {
          label: intl.formatMessage(buttonMessages.change),
          disabled: true
        }
      },
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
      this.props.goToStep(
        ProtectedAccoutStep.CONFIRMATION,
        this.props.setupData
      )
    }
    const onError = () => {
      this.setState({
        submitError: true
      })
    }
    return (
      <ActionPageLight
        title={intl.formatMessage(messages.userSetupRevieTitle)}
        goBack={() => {
          this.props.goToStep(
            ProtectedAccoutStep.SECURITY_QUESTION,
            this.props.setupData
          )
        }}
      >
        <Header>{intl.formatMessage(messages.userSetupReviewHeader)}</Header>
        <Instruction>{intl.formatMessage(messages.instruction)}</Instruction>
        <GlobalError id="GlobalError">
          {this.state.submitError && (
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
        <Mutation
          mutation={activateUserMutation}
          variables={{ ...this.props.setupData }}
          onCompleted={() => onCompleted()}
          onError={() => onError()}
        >
          {(submitActivateUser: any, { loading }: { loading: any }) => {
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
              <Action>
                <ConfirmButton
                  id="Confirm"
                  onClick={() => submitActivateUser()}
                >
                  <Check />
                  {intl.formatMessage(buttonMessages.confirm)}
                </ConfirmButton>
              </Action>
            )
          }}
        </Mutation>
      </ActionPageLight>
    )
  }
}

export const UserSetupReview = connect((state: IStoreState) => ({
  language: state.i18n.language,
  userDetails: getUserDetails(state)
}))(injectIntl(UserSetupReviewComponent))
