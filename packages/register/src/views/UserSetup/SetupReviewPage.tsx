import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
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
} from '@register/components/ProtectedAccount'
import { getUserDetails } from '@register/profile/profileSelectors'
import { IStoreState } from '@register/store'
import { createNamesMap } from '@register/utils/data-formatting'
import { IUserDetails } from '@register/utils/userUtils'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { roleMessages, typeMessages } from '@register/utils/roleTypeMessages'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import {
  QUESTION_KEYS,
  questionMessages
} from '@register/utils/userSecurityQuestions'
import { Check } from '@opencrvs/components/lib/icons'

const activateUserMutation = gql`
  mutation submitActivateUser(
    $userId: String!
    $password: String!
    $securityQuestionAnswers: [SecurityQuestionAnswer]!
  ) {
    activateUser(
      userId: $userId
      password: $password
      securityQNAs: $securityQuestionAnswers
    )
  }
`

const messages = defineMessages({
  title: {
    id: 'userSetup.review.title',
    defaultMessage: 'Your details'
  },
  header: {
    id: 'userSetup.review.header',
    defaultMessage: 'Confirm your details'
  },
  instruction: {
    id: 'userSetupReview.instruction',
    defaultMessage:
      'Check the details below to confirm your account details are correct. and make annecessary changes to confirm your account details are correct.'
  },
  labelEnglishName: {
    id: 'label.nameEN',
    defaultMessage: 'English name'
  },
  labelBanglaName: {
    id: 'label.nameBN',
    defaultMessage: 'Bengali name'
  },
  labelPhone: {
    id: 'label.phone',
    defaultMessage: 'Phone number'
  },
  labelAssignedOffice: {
    id: 'label.assignedOffice',
    defaultMessage: 'Assigned office'
  },
  labelRoleType: {
    id: 'label.roleType',
    defaultMessage: 'Role / Type'
  },
  actionChange: {
    id: 'action.change',
    defaultMessage: 'Change'
  },
  confirm: {
    id: 'button.confirm',
    defaultMessage: 'Confirm'
  },
  wiating: {
    id: 'user.setup.waiting',
    defaultMessage: 'Setting up your account'
  },
  submitError: {
    id: 'error.occured',
    defaultMessage: 'An error occured. Please try again.'
  }
})

const Header = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
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
  display: flex;
  & svg {
    margin-right: 16px;
  }
`

const LoaderOverlay = styled.div`
  background: ${({ theme }) => theme.colors.white};
  /* border: 1px solid; */
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

type IFullProps = IProps & InjectedIntlProps

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

    const typeRole =
      (userDetails &&
        (userDetails.type
          ? `${intl.formatMessage(
              typeMessages[userDetails.type as string]
            )} / ${intl.formatMessage(
              roleMessages[userDetails.role as string]
            )}`
          : `${intl.formatMessage(
              roleMessages[userDetails.role as string]
            )}`)) ||
      ''

    const primaryOffice =
      (userDetails &&
        userDetails.primaryOffice &&
        userDetails.primaryOffice.name) ||
      ''

    const answeredQuestions: IDataProps[] = []
    this.props.setupData.securityQuestionAnswers &&
      this.props.setupData.securityQuestionAnswers.forEach(e => {
        answeredQuestions.push({
          label: intl.formatMessage(questionMessages[e.questionKey]),
          value: e.answer,
          action: {
            id: `Question_${e.questionKey}`,
            label: intl.formatMessage(messages.actionChange),
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
        label: intl.formatMessage(messages.labelBanglaName),
        value: bengaliName,
        action: {
          label: intl.formatMessage(messages.actionChange),
          disabled: true
        }
      },
      {
        label: intl.formatMessage(messages.labelEnglishName),
        value: englishName,
        action: {
          label: intl.formatMessage(messages.actionChange),
          disabled: true
        }
      },
      {
        label: intl.formatMessage(messages.labelPhone),
        value: '01711111111',
        action: {
          label: intl.formatMessage(messages.actionChange),
          disabled: true
        }
      },
      {
        label: intl.formatMessage(messages.labelAssignedOffice),
        value: primaryOffice
      },
      {
        label: intl.formatMessage(messages.labelRoleType),
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
        title={intl.formatMessage(messages.title)}
        goBack={() => {
          this.props.goToStep(
            ProtectedAccoutStep.SECURITY_QUESTION,
            this.props.setupData
          )
        }}
      >
        <Header>{intl.formatMessage(messages.header)}</Header>
        <Instruction>{intl.formatMessage(messages.instruction)}</Instruction>
        <GlobalError id="GlobalError">
          {this.state.submitError && (
            <WarningMessage>
              {intl.formatMessage(messages.submitError)}
            </WarningMessage>
          )}
        </GlobalError>
        <div>
          {items.map((item: IDataProps, index: number) => (
            <DataRow key={index} {...item} />
          ))}
        </div>
        <Mutation
          mutation={activateUserMutation}
          variables={{ ...this.props.setupData }}
          onCompleted={() => onCompleted()}
          onError={onError}
        >
          {(
            submitActivateUser: any,
            { loading, data }: { loading: any; data?: any }
          ) => {
            if (loading) {
              return (
                <LoaderOverlay>
                  <Loader
                    id={`setup_submit_waiting`}
                    marginPercent={20}
                    spinnerDiameter={60}
                    loadingText={intl.formatMessage(messages.wiating)}
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
                  {intl.formatMessage(messages.confirm)}
                </ConfirmButton>
              </Action>
            )
          }}
        </Mutation>
      </ActionPageLight>
    )
  }
}

export const UserSetupReview = connect(
  function mapStateToProps(state: IStoreState) {
    return {
      userDetails: getUserDetails(state)
    }
  },
  null
)(injectIntl(UserSetupReviewComponent))
