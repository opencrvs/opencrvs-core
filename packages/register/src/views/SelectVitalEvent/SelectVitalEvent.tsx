import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'

import {
  goToBirthRegistration,
  goToDeathRegistration,
  goBack as goBackAction
} from '@register/navigation'
import { Dispatch } from 'redux'
import { createApplication, storeApplication } from '@register/applications'
import { Event } from '@register/forms'
import { Cross, ApplicationIcon } from '@opencrvs/components/lib/icons'
import { PrimaryButton, Button } from '@opencrvs/components/lib/buttons'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { RadioButton } from '@opencrvs/components/lib/interface'
import styled from '@register/styledComponents'

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

const BodyContent = styled.div`
  max-width: 940px;
  margin: auto;
  padding: 0 16px;
  position: relative;
`
const TopBar = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 64px;
  background: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.shadows.mistyShadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const TopBarTitle = styled.h4`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  padding-left: 16px;
`
const Item = styled.span`
  display: flex;
  align-items: center;
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
const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  position: absolute;
  width: 100%;
  height: 100%;
`
class SelectVitalEventView extends React.Component<
  InjectedIntlProps & {
    goToBirthRegistration: typeof goToBirthRegistration
    goToDeathRegistration: () => void
    goBack: typeof goBackAction
  }
> {
  state = {
    goTo: ''
  }
  handleContinue = () => {
    switch (this.state.goTo) {
      case 'birth':
        this.props.goToBirthRegistration()
        break
      case 'death':
        this.props.goToDeathRegistration()
        break
      default:
        this.setState({ goTo: 'error' })
    }
  }
  render() {
    const { intl } = this.props
    return (
      <Container>
        <TopBar>
          <Item>
            {' '}
            <ApplicationIcon />{' '}
            <TopBarTitle>
              {intl.formatMessage(messages.registerNewEventTitle)}
            </TopBarTitle>
          </Item>
          <Item>
            <Button icon={() => <Cross />} onClick={this.props.goBack} />
          </Item>
        </TopBar>
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
    )
  }
}

export const SelectVitalEvent = connect(
  null,
  function mapDispatchToProps(dispatch: Dispatch) {
    return {
      goToBirthRegistration: () => dispatch(goToBirthRegistration()),
      goToDeathRegistration: () => {
        const application = createApplication(Event.DEATH)
        dispatch(storeApplication(application))
        dispatch(goToDeathRegistration(application.id))
      },
      goBack: () => dispatch(goBackAction())
    }
  }
)(injectIntl(SelectVitalEventView))
