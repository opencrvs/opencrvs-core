import * as React from 'react'
import styled from '@register/styledComponents'
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
import { messages } from '@register/i18n/messages/views/selectVitalEvent'
import { constantsMessages, buttonMessages } from '@register/i18n/messages'

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
      <Container>
        <EventTopBar
          title={intl.formatMessage(messages.registerNewEventTitle)}
          goHome={this.props.goToHome}
        />

        <BodyContent>
          <Title>{intl.formatMessage(messages.registerNewEventHeading)}</Title>
          {this.state.goTo === 'error' && (
            <ErrorText>{intl.formatMessage(messages.errorMessage)}</ErrorText>
          )}
          <Actions id="select_vital_event_view">
            <RadioButton
              size="large"
              key="birthevent"
              name="birthevent"
              label={intl.formatMessage(constantsMessages.birth)}
              value="birth"
              id="select_birth_event"
              selected={this.state.goTo === 'birth' ? 'birth' : ''}
              onChange={() => this.setState({ goTo: 'birth' })}
            />
            <RadioButton
              size="large"
              key="deathevent"
              name="deathevent"
              label={intl.formatMessage(constantsMessages.death)}
              value="death"
              id="select_death_event"
              selected={this.state.goTo === 'death' ? 'death' : ''}
              onChange={() => this.setState({ goTo: 'death' })}
            />
          </Actions>
          <PrimaryButton id="continue" onClick={this.handleContinue}>
            {intl.formatMessage(buttonMessages.continueButton)}
          </PrimaryButton>
        </BodyContent>
      </Container>
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
