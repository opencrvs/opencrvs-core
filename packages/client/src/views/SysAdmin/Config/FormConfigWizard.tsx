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

import React from 'react'
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { getScope } from '@client/profile/profileSelectors'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { RouteComponentProps, Redirect } from 'react-router'
import { HOME } from '@client/navigation/routes'
import { EventTopBar } from '@opencrvs/components/lib/interface'
import { SettingsBlue } from '@opencrvs/components/lib/icons'
import {
  SecondaryButton,
  SuccessButton
} from '@opencrvs/components/lib/buttons'
import { goBack } from 'connected-react-router'
import styled from '@client/styledComponents'
import {
  PageNavigation,
  TAB_BIRTH,
  TAB_DEATH
} from '@client/components/formConfig/PageNavigation'
import { FormTools } from '@client/components/formConfig/formTools/FormTools'
import { FormConfigCanvas } from '@client/components/formConfig/FormConfigCanvas'
import { IForm, Event } from '@client/forms'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { goToFormConfigWizard } from '@client/navigation'
import { buttonMessages } from '@client/i18n/messages'
import { Scope, isNatlSysAdmin } from '@client/utils/authUtils'

type RouteProps = RouteComponentProps<{
  event: string
  section: string
}>

interface IStateProps {
  scope: Scope | null
  registerForm: { [key: string]: IForm }
  event?: Event
  section?: string | undefined
}

interface IDispatchProps {
  goBack: typeof goBack
  goToFormConfigWizard: typeof goToFormConfigWizard
}

const WizardContainer = styled.div`
  margin-top: 56px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const NavigationContainer = styled.div`
  top: 56px;
  width: 250px;
  position: fixed;
  height: 100%;
  border-right: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
`

const ToolsContainer = styled.div`
  right: 0px;
  top: 56px;
  width: 348px;
  position: fixed;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 30px;
  height: 100%;
  border-left: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
`

type IFullProps = IDispatchProps & IStateProps & IntlShapeProps & RouteProps

const topBarActions = (props: IFullProps) => {
  return [
    <SettingsBlue key="settings" onClick={() => {}} />,
    <SecondaryButton key="save" size="small" onClick={() => {}}>
      {props.intl.formatMessage(buttonMessages.save)}
    </SecondaryButton>,
    <SuccessButton key="publish" size="small" onClick={() => {}}>
      {props.intl.formatMessage(buttonMessages.publish)}
    </SuccessButton>
  ]
}

function FormConfigWizardComp(props: IFullProps) {
  if (
    !(props.scope && isNatlSysAdmin(props.scope)) ||
    !props.event ||
    !props.section
  ) {
    return <Redirect to={HOME} />
  }

  return (
    <>
      <EventTopBar
        title={'Birth v0.1'}
        pageIcon={<></>}
        topBarActions={topBarActions(props)}
        goHome={() => props.goBack()}
      />
      <WizardContainer>
        <NavigationContainer>
          <PageNavigation
            registerForm={props.registerForm}
            event={props.event}
            intl={props.intl}
            section={props.section}
            goToFormConfigWizard={props.goToFormConfigWizard}
          />
        </NavigationContainer>
        <FormConfigCanvas></FormConfigCanvas>
        <ToolsContainer>
          <FormTools intl={props.intl} />
        </ToolsContainer>
      </WizardContainer>
    </>
  )
}

function mapStateToProps(state: IStoreState, props: RouteProps): IStateProps {
  const { event, section: sectionKey } = props.match.params
  let section: string | undefined
  if (sectionKey in TAB_BIRTH && event === 'birth') {
    section = TAB_BIRTH[sectionKey as keyof typeof TAB_BIRTH]
  } else if (sectionKey in TAB_DEATH && event === 'death') {
    section = TAB_DEATH[sectionKey as keyof typeof TAB_DEATH]
  }
  return {
    scope: getScope(state),
    registerForm: getRegisterForm(state),
    event:
      event === 'birth'
        ? Event.BIRTH
        : event === 'death'
        ? Event.DEATH
        : undefined,
    section
  }
}

export const FormConfigWizard = connect<
  IStateProps,
  IDispatchProps,
  RouteProps,
  IStoreState
>(mapStateToProps, { goBack, goToFormConfigWizard })(
  injectIntl(FormConfigWizardComp)
)
