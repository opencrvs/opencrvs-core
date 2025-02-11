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
import React, { useState } from 'react'
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
import { SCOPES } from '@opencrvs/commons/client'
import { EventType } from '@client/utils/gateway'
import { formatUrl } from '@client/navigation'
import { messages } from '@client/i18n/messages/views/selectVitalEvent'
import { constantsMessages, buttonMessages } from '@client/i18n/messages'
import {
  storeDeclaration,
  IDeclaration,
  createDeclaration
} from '@client/declarations'
import ProtectedComponent from '@client/components/ProtectedComponent'

import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import * as routes from '@client/navigation/routes'

type DispatchProps = {
  storeDeclaration: typeof storeDeclaration
}

type GoToType = '' | EventType

const SelectVitalEventView = (
  props: IntlShapeProps & RouteComponentProps<IntlShapeProps> & DispatchProps
) => {
  const { intl, storeDeclaration } = props

  const [goTo, setGoTo] = useState<GoToType>('')
  const [noEventSelectedError, setNoEventSelectedError] = useState(false)

  const handleContinue = () => {
    if (goTo === '') {
      return setNoEventSelectedError(true)
    }
    let declaration: IDeclaration
    switch (goTo as EventType) {
      case EventType.Birth:
        declaration = createDeclaration(EventType.Birth)
        storeDeclaration(declaration)

        props.router.navigate(
          formatUrl(routes.DRAFT_BIRTH_PARENT_FORM, {
            declarationId: declaration.id
          })
        )
        break
      case EventType.Death:
        declaration = createDeclaration(EventType.Death)
        storeDeclaration(declaration)
        props.router.navigate(
          formatUrl(routes.DRAFT_DEATH_FORM, {
            declarationId: declaration.id
          })
        )
        break
      case EventType.Marriage:
        declaration = createDeclaration(EventType.Marriage)
        storeDeclaration(declaration)
        props.router.navigate(
          formatUrl(routes.DRAFT_MARRIAGE_FORM, {
            declarationId: declaration.id
          })
        )
        break
      default:
        throw new Error(`Unknown eventType ${goTo}`)
    }
  }

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
              onClick={() => props.router.navigate(routes.HOME)}
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
              onClick={() => props.router.navigate(routes.HOME)}
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
            onClick={handleContinue}
          >
            {intl.formatMessage(buttonMessages.continueButton)}
          </Button>
        ]}
      >
        {noEventSelectedError && (
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
          <ProtectedComponent
            scopes={[
              SCOPES.RECORD_DECLARE_BIRTH,
              SCOPES.RECORD_DECLARE_BIRTH_MY_JURISDICTION
            ]}
          >
            <RadioButton
              size="large"
              key="birthevent"
              name="birthevent"
              label={intl.formatMessage(constantsMessages.birth)}
              value="birth"
              id="select_birth_event"
              selected={goTo === EventType.Birth ? EventType.Birth : ''}
              onChange={() => {
                setGoTo(EventType.Birth)
                setNoEventSelectedError(false)
              }}
            />
          </ProtectedComponent>
          {window.config.FEATURES.DEATH_REGISTRATION && (
            <ProtectedComponent
              scopes={[
                SCOPES.RECORD_DECLARE_DEATH,
                SCOPES.RECORD_DECLARE_DEATH_MY_JURISDICTION
              ]}
            >
              <RadioButton
                size="large"
                key="deathevent"
                name="deathevent"
                label={intl.formatMessage(constantsMessages.death)}
                value="death"
                id="select_death_event"
                selected={goTo === EventType.Death ? EventType.Death : ''}
                onChange={() => {
                  setGoTo(EventType.Death)
                  setNoEventSelectedError(false)
                }}
              />
            </ProtectedComponent>
          )}
          {window.config.FEATURES.MARRIAGE_REGISTRATION && (
            <ProtectedComponent
              scopes={[
                SCOPES.RECORD_DECLARE_MARRIAGE,
                SCOPES.RECORD_DECLARE_MARRIAGE_MY_JURISDICTION
              ]}
            >
              <RadioButton
                size="large"
                key="marriagevent"
                name="marriageevent"
                label={intl.formatMessage(constantsMessages.marriage)}
                value="marriage"
                id="select_marriage_event"
                selected={goTo === EventType.Marriage ? EventType.Marriage : ''}
                onChange={() => {
                  setGoTo(EventType.Marriage)
                  setNoEventSelectedError(false)
                }}
              />
            </ProtectedComponent>
          )}
        </Stack>
      </Content>
    </Frame>
  )
}

export const SelectVitalEvent = withRouter(
  connect(null, {
    storeDeclaration
  })(injectIntl(SelectVitalEventView))
)
