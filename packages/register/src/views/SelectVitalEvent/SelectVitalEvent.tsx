import * as React from 'react'
import styled, { keyframes } from '@register/styledComponents'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { EventTopBar, RadioButton } from '@opencrvs/components/lib/interface'
import { BodyContent, Container } from '@opencrvs/components/lib/layout'
import {
  createApplication,
  IApplication,
  setInitialApplications,
  storeApplication
} from '@register/applications'
import { Event } from '@register/forms'
import {
  goBack,
  goToBirthInformant,
  goToDeathInformant,
  goToHome
} from '@register/navigation'
import {
  PAGE_TRANSITIONS_CLASSNAME,
  PAGE_TRANSITIONS_ENTER_TIME,
  PAGE_TRANSITIONS_TIMING_FUNC_N_FILL_MODE
} from '@register/utils/constants'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  registerNewEventTitle: {
    id: 'register.selectVitalEvent.registerNewEventTitle',
    defaultMessage: 'New application',
    description: 'The title that appears on the select vital event page'
  },
  registerNewEventHeading: {
    id: 'register.selectVitalEvent.registerNewEventHeading',
    defaultMessage: 'What type of event do you want to declare?',
    description: 'The section heading on the page'
  },
  birth: {
    id: 'register.selectVitalEvent.birth',
    defaultMessage: 'Birth',
    description: 'Birth Text'
  },
  death: {
    id: 'register.selectVitalEvent.death',
    defaultMessage: 'Death',
    description: 'Death text'
  },
  continueButton: {
    id: 'register.selectVitalEvent.continueButton',
    defaultMessage: 'Continue',
    description: 'Continue Button Text'
  },
  errorMessage: {
    id: 'register.selectVitalEvent.errorMessage',
    defaultMessage: 'Please select the type of event',
    description: 'Error Message to show when no event is being selected'
  }
})

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

const fadeFromBottom = keyframes`
from {
   -webkit-transform: translateY(100%);
   transform: translateY(100%);
  }
`
const StyledContainer = styled.div`
  top: 0;
  min-height: calc(100vh - 40px);
  width: 100%;
  &.${PAGE_TRANSITIONS_CLASSNAME}-enter {
    animation: ${fadeFromBottom} ${PAGE_TRANSITIONS_ENTER_TIME}ms
      ${PAGE_TRANSITIONS_TIMING_FUNC_N_FILL_MODE};
    z-index: 999;
  }

  &.${PAGE_TRANSITIONS_CLASSNAME}-enter-done {
    position: fixed;
  }
  &.${PAGE_TRANSITIONS_CLASSNAME}-enter-active {
    z-index: 999;
    position: fixed;
  }
`
class SelectVitalEventView extends React.Component<
  InjectedIntlProps & {
    goBack: typeof goBack
    goToHome: typeof goToHome
    storeApplication: typeof storeApplication
    goToBirthInformant: typeof goToBirthInformant
    goToDeathInformant: typeof goToDeathInformant
    setInitialApplications: typeof setInitialApplications
  }
> {
  state = {
    goTo: ''
  }
  handleContinue = () => {
    let application: IApplication
    switch (this.state.goTo) {
      case 'birth':
        application = createApplication(Event.BIRTH)
        this.props.storeApplication(application)
        this.props.goToBirthInformant(application.id)

        break
      case 'death':
        application = createApplication(Event.DEATH)
        this.props.storeApplication(application)
        this.props.goToDeathInformant(application.id)
        break
      default:
        this.setState({ goTo: 'error' })
    }
  }
  render() {
    const { intl } = this.props
    return (
      <StyledContainer className={PAGE_TRANSITIONS_CLASSNAME}>
        <Container>
          <EventTopBar
            title={intl.formatMessage(messages.registerNewEventTitle)}
            goHome={this.props.goToHome}
          />

          <BodyContent>
            <Title>
              {intl.formatMessage(messages.registerNewEventHeading)}
            </Title>
            {this.state.goTo === 'error' && (
              <ErrorText>{intl.formatMessage(messages.errorMessage)}</ErrorText>
            )}
            <Actions id="select_vital_event_view">
              <RadioButton
                size="large"
                key="birthevent"
                name="birthevent"
                label={intl.formatMessage(messages.birth)}
                value="birth"
                id="select_birth_event"
                selected={this.state.goTo === 'birth' ? 'birth' : ''}
                onChange={() => this.setState({ goTo: 'birth' })}
              />
              <RadioButton
                size="large"
                key="deathevent"
                name="deathevent"
                label={intl.formatMessage(messages.death)}
                value="death"
                id="select_death_event"
                selected={this.state.goTo === 'death' ? 'death' : ''}
                onChange={() => this.setState({ goTo: 'death' })}
              />
            </Actions>
            <PrimaryButton id="continue" onClick={this.handleContinue}>
              {intl.formatMessage(messages.continueButton)}
            </PrimaryButton>
          </BodyContent>
        </Container>
      </StyledContainer>
    )
  }
}

export const SelectVitalEvent = connect(
  null,
  {
    goBack,
    goToHome,
    storeApplication,
    goToBirthInformant,
    goToDeathInformant,
    setInitialApplications
  }
)(injectIntl(SelectVitalEventView))
