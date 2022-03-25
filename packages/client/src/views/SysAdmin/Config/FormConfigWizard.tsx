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
import { Scope } from '@client/utils/authUtils'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { RouteComponentProps, Redirect } from 'react-router'
import { HOME } from '@client/navigation/routes'
import { EventTopBar } from '@opencrvs/components/lib/interface'
import { ITopBarAction } from '@opencrvs/components/lib/interface/EventTopBar'

import { SettingsBlue } from '@opencrvs/components/lib/icons'
import {
  SecondaryButton,
  SuccessButton
} from '@opencrvs/components/lib/buttons'
import { goBack } from 'connected-react-router'
import styled from '@client/styledComponents'
import {
  PageNavigation,
  TAB_BIRTH
} from '@client/components/formConfig/PageNavigation'
import { FormTools } from '@client/components/formConfig/formTools/FormTools'
import { FormConfigCanvas } from '@client/components/formConfig/FormConfigCanvas'
import { IForm } from '@client/forms'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { goToPageNavigation } from '@client/navigation'

export enum EventType {
  BIRTH = 'birth',
  DEATH = 'death'
}

type RouteProps = RouteComponentProps<{
  event: string
  section: string
}>

interface IStateProps {
  scope: Scope | null
  registerForm: { [key: string]: IForm }
  event?: EventType
  section?: string
}

interface IDispatchProps {
  goBack: typeof goBack
  goToPageNavigation: typeof goToPageNavigation
}

const WizardContainer = styled.div`
  margin-top: 56px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

type IFullProps = IDispatchProps & IStateProps & IntlShapeProps & RouteProps

const topBarActions: ITopBarAction[] = [
  {
    icon: <SettingsBlue />,
    handler: () => alert('settings'),
    marginRight: 18
  },
  {
    icon: <SecondaryButton> save </SecondaryButton>,
    handler: () => alert('save')
  },
  {
    icon: <SuccessButton> publish </SuccessButton>,
    handler: () => alert('publish')
  }
]

function FormConfigWizardComp(props: IFullProps) {
  if (
    !props.scope?.includes('natlsysadmin') ||
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
        topBarActions={topBarActions}
        goHome={() => props.goBack()}
      />
      <WizardContainer>
        <PageNavigation
          registerForm={props.registerForm}
          event={props.event}
          intl={props.intl}
          section={props.section}
          goToPageNavigation={props.goToPageNavigation}
        />
        <FormConfigCanvas>Form Config Wizard</FormConfigCanvas>
        <FormTools intl={props.intl} />
      </WizardContainer>
    </>
  )
}

function mapStateToProps(state: IStoreState, props: RouteProps): IStateProps {
  const { event, section } = props.match.params
  return {
    scope: getScope(state),
    registerForm: getRegisterForm(state),
    event:
      event === 'birth'
        ? EventType.BIRTH
        : event === 'death'
        ? EventType.DEATH
        : undefined,
    section: (section as keyof typeof TAB_BIRTH) || 'introduction'
  }
}

export const FormConfigWizard = connect<
  IStateProps,
  IDispatchProps,
  RouteProps,
  IStoreState
>(mapStateToProps, { goBack, goToPageNavigation })(
  injectIntl(FormConfigWizardComp)
)
