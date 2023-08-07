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
import styled, { keyframes } from 'styled-components'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { RadioButton } from '@opencrvs/components/lib/Radio'
import { Frame } from '@opencrvs/components/lib/Frame'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Content } from '@opencrvs/components/lib/Content'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Event } from '@client/utils/gateway'
import {
  goBack,
  goToHome,
  goToDeathInformant,
  goToBirthRegistrationAsParent,
  goToMarriageInformant
} from '@client/navigation'
import { messages } from '@client/i18n/messages/views/selectVitalEvent'
import { constantsMessages, buttonMessages } from '@client/i18n/messages'

import {
  storeDeclaration,
  IDeclaration,
  createDeclaration
} from '@client/declarations'

const Actions = styled.div`
  & > div {
    margin-bottom: 16px;
  }
`

class SelectVitalEventView extends React.Component<
  IntlShapeProps & {
    goBack: typeof goBack
    goToHome: typeof goToHome
    storeDeclaration: typeof storeDeclaration
    goToBirthRegistrationAsParent: typeof goToBirthRegistrationAsParent
    goToDeathInformant: typeof goToDeathInformant
    goToMarriageInformant: typeof goToMarriageInformant
  }
> {
  state = {
    goTo: '',
    noEventSelectedError: false
  }
  handleContinue = () => {
    if (this.state.goTo === '') {
      this.setState({ noEventSelectedError: true })
    } else {
      let declaration: IDeclaration
      switch (this.state.goTo as Event) {
        case Event.Birth:
          declaration = createDeclaration(Event.Birth)
          this.props.storeDeclaration(declaration)
          this.props.goToBirthRegistrationAsParent(declaration.id)
          break
        case Event.Death:
          declaration = createDeclaration(Event.Death)
          this.props.storeDeclaration(declaration)
          this.props.goToDeathInformant(declaration.id)
          break
        case Event.Marriage:
          declaration = createDeclaration(Event.Marriage)
          this.props.storeDeclaration(declaration)
          this.props.goToMarriageInformant(declaration.id)
          break
        default:
          throw new Error(`Unknown eventType ${this.state.goTo}`)
      }
    }
  }

  render() {
    const { intl } = this.props
    return (
      <Frame
        header={
          <AppBar
            desktopLeft={<Icon name="Draft" size="large" />}
            desktopTitle={intl.formatMessage(messages.registerNewEventTitle)}
            desktopRight={
              <Button
                id="goBack"
                type="secondary"
                size="medium"
                onClick={this.props.goToHome}
              >
                <Icon name="X" />
                {intl.formatMessage(buttonMessages.exitButton)}
              </Button>
            }
            mobileLeft={<Icon name="Draft" size="large" />}
            mobileTitle={intl.formatMessage(messages.registerNewEventTitle)}
            mobileRight={
              <Button type="icon" size="medium" onClick={this.props.goToHome}>
                <Icon name="X" />
              </Button>
            }
          />
        }
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
      >
        <Content
          title={intl.formatMessage(messages.registerNewEventHeading)}
          bottomActionButtons={[
            <Button
              key="select-vital-event-continue"
              id="continue"
              type="primary"
              size="large"
              onClick={this.handleContinue}
            >
              {intl.formatMessage(buttonMessages.continueButton)}
            </Button>
          ]}
        >
          {this.state.noEventSelectedError && (
            <ErrorText id="require-error">
              {intl.formatMessage(messages.errorMessage)}
            </ErrorText>
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
              onChange={() =>
                this.setState({ goTo: 'birth', noEventSelectedError: false })
              }
            />
            <RadioButton
              size="large"
              key="deathevent"
              name="deathevent"
              label={intl.formatMessage(constantsMessages.death)}
              value="death"
              id="select_death_event"
              selected={this.state.goTo === 'death' ? 'death' : ''}
              onChange={() =>
                this.setState({ goTo: 'death', noEventSelectedError: false })
              }
            />
            {window.config.MARRIAGE_REGISTRATION && (
              <RadioButton
                size="large"
                key="marriagevent"
                name="marriageevent"
                label={intl.formatMessage(constantsMessages.marriage)}
                value="marriage"
                id="select_marriage_event"
                selected={this.state.goTo === 'marriage' ? 'marriage' : ''}
                onChange={() =>
                  this.setState({
                    goTo: 'marriage',
                    noEventSelectedError: false
                  })
                }
              />
            )}
          </Actions>
        </Content>
      </Frame>
    )
  }
}

export const SelectVitalEvent = connect(null, {
  goBack,
  goToHome,
  storeDeclaration,
  goToBirthRegistrationAsParent,
  goToDeathInformant,
  goToMarriageInformant
})(injectIntl(SelectVitalEventView))
