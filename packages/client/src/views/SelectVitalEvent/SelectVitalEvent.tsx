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
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { RadioButton } from '@opencrvs/components/lib/Radio'
import { Frame } from '@opencrvs/components/lib/Frame'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Stack } from '@opencrvs/components/lib/Stack'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Event } from '@client/utils/gateway'
import { formatUrl } from '@client/navigation'
import { messages } from '@client/i18n/messages/views/selectVitalEvent'
import { constantsMessages, buttonMessages } from '@client/i18n/messages'

import {
  storeDeclaration,
  IDeclaration,
  createDeclaration
} from '@client/declarations'
import { RouteComponentProps, withRouter } from '@client/components/WithRouter'
import { IStoreState } from '@client/store'
import * as routes from '@client/navigation/routes'

type DispatchProps = {
  storeDeclaration: typeof storeDeclaration
}
class SelectVitalEventView extends React.Component<
  RouteComponentProps<IntlShapeProps> & DispatchProps
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

          this.props.router.navigate(
            formatUrl(routes.DRAFT_BIRTH_PARENT_FORM, {
              declarationId: declaration.id
            })
          )
          break
        case Event.Death:
          declaration = createDeclaration(Event.Death)
          this.props.storeDeclaration(declaration)

          this.props.router.navigate(
            formatUrl(routes.DRAFT_DEATH_FORM, {
              declarationId: declaration.id
            })
          )
          break
        case Event.Marriage:
          declaration = createDeclaration(Event.Marriage)
          this.props.storeDeclaration(declaration)
          this.props.router.navigate(
            formatUrl(routes.DRAFT_MARRIAGE_FORM, {
              declarationId: declaration.id
            })
          )
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
                size="small"
                onClick={() => this.props.router.navigate(routes.HOME)}
              >
                <Icon name="X" />
                {intl.formatMessage(buttonMessages.exitButton)}
              </Button>
            }
            mobileLeft={<Icon name="Draft" size="large" />}
            mobileTitle={intl.formatMessage(messages.registerNewEventTitle)}
            mobileRight={
              <Button
                type="icon"
                size="medium"
                onClick={() => this.props.router.navigate(routes.HOME)}
              >
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
          size={ContentSize.SMALL}
          title={intl.formatMessage(messages.registerNewEventHeading)}
          bottomActionButtons={[
            <Button
              key="select-vital-event-continue"
              id="continue"
              type="primary"
              size="large"
              fullWidth
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
          <Stack
            id="select_vital_event_view"
            direction="column"
            alignItems="left"
            gap={0}
          >
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
            {window.config.FEATURES.DEATH_REGISTRATION && (
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
            )}
            {window.config.FEATURES.MARRIAGE_REGISTRATION && (
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
          </Stack>
        </Content>
      </Frame>
    )
  }
}

export const SelectVitalEvent = withRouter(
  connect(null, {
    storeDeclaration
  })(injectIntl(SelectVitalEventView))
)
