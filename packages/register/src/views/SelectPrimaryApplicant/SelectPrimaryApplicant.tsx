import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'

import {
  goToBirthRegistrationAsParent,
  goToRegistrarHomeTab as goHomeAction,
  goBack as goBackAction
} from '@register/navigation'
import { Dispatch } from 'redux'
import { createApplication, storeApplication } from '@register/applications'
import { Event } from '@register/forms'

import {
  PrimaryButton,
  TertiaryButton,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { RadioButton, EventTopBar } from '@opencrvs/components/lib/interface'
import styled from '@register/styledComponents'
import { BackArrow } from '@opencrvs/components/lib/icons'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  registerNewEventTitle: {
    id: 'register.selectVitalEvent.registerNewEventTitle',
    defaultMessage: 'New application',
    description: 'The title that appears on the select vital event page'
  },
  registerNewEventHeading: {
    id: 'register.primaryApplicant.registerNewEventHeading',
    defaultMessage: 'Who is the primary applicant for this application?',
    description: 'The section heading on the page'
  },
  primaryApplicantDescription: {
    id: 'register.primaryApplicant.description',
    defaultMessage:
      'This person is responsible for providing accurate information in this application. ',
    description: 'The section heading on the page'
  },
  mother: {
    id: 'register.selectInformant.mother',
    defaultMessage: 'Mother',
    description: 'The description that appears when asking for the informant'
  },
  father: {
    id: 'register.selectInformant.father',
    defaultMessage: 'Father',
    description: 'The title that appears when selecting the parent as informant'
  },
  continueButton: {
    id: 'register.selectVitalEvent.continueButton',
    defaultMessage: 'Continue',
    description: 'Continue Button Text'
  },
  errorMessage: {
    id: 'register.primaryApplicant.errorMessage',
    defaultMessage: 'Please select who is the primary applicant',
    description: 'Error Message to show when no event is being selected'
  },
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  }
})

const BodyContent = styled.div`
  max-width: 940px;
  margin: auto;
  padding: 16px 32px;
  position: relative;
`

const Title = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  margin-bottom: 16px;
`
const Actions = styled.div`
  padding: 32px 0;
  & div:first-child {
    margin-bottom: 16px;
  }
`
const Description = styled.p`
  ${({ theme }) => theme.fonts.bodyStyle};
`
class SelectPrimaryApplicantView extends React.Component<
  InjectedIntlProps & {
    goToBirthRegistration: () => void

    goHome: () => void
    goBack: () => void
  }
> {
  state = {
    goTo: ''
  }
  handleContinue = () => {
    if (this.state.goTo === 'mother' || this.state.goTo === 'father') {
      this.props.goToBirthRegistration()
    } else {
      this.setState({ goTo: 'error' })
    }
  }
  render() {
    const { intl } = this.props
    return (
      <>
        <EventTopBar
          title={intl.formatMessage(messages.registerNewEventTitle)}
          goHome={this.props.goHome}
        />

        <BodyContent>
          <TertiaryButton
            align={ICON_ALIGNMENT.LEFT}
            icon={() => <BackArrow />}
            onClick={this.props.goBack}
          >
            {intl.formatMessage(messages.back)}
          </TertiaryButton>
          <Title>{intl.formatMessage(messages.registerNewEventHeading)}</Title>
          <Description>
            {intl.formatMessage(messages.primaryApplicantDescription)}
          </Description>
          {this.state.goTo === 'error' && (
            <ErrorText id="error_text">
              {intl.formatMessage(messages.errorMessage)}
            </ErrorText>
          )}
          <Actions id="primary_applicant_selection_view">
            <RadioButton
              size="large"
              key="motherevent"
              name="motherevent"
              label={intl.formatMessage(messages.mother)}
              value="mother"
              id="select_mother_event"
              selected={this.state.goTo === 'mother' ? 'mother' : ''}
              onChange={() => this.setState({ goTo: 'mother' })}
            />
            <RadioButton
              size="large"
              key="fatherevent"
              name="fatherevent"
              label={intl.formatMessage(messages.father)}
              value="father"
              id="select_father_event"
              selected={this.state.goTo === 'father' ? 'father' : ''}
              onChange={() => this.setState({ goTo: 'father' })}
            />
          </Actions>
          <PrimaryButton id="continue" onClick={this.handleContinue}>
            {intl.formatMessage(messages.continueButton)}
          </PrimaryButton>
        </BodyContent>
      </>
    )
  }
}

export const SelectPrimaryApplicant = connect(
  null,
  function mapDispatchToProps(dispatch: Dispatch) {
    return {
      goToBirthRegistration: () => {
        const application = createApplication(Event.BIRTH)
        dispatch(storeApplication(application))
        dispatch(goToBirthRegistrationAsParent(application.id))
      },
      goHome: () => dispatch(goHomeAction('review')),
      goBack: () => dispatch(goBackAction())
    }
  }
)(injectIntl(SelectPrimaryApplicantView))
