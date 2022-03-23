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
import { PageNavigation } from '@client/components/config/PageNavigation'
import { FormTools } from '@client/components/config/FormTools'
import { FormConfigCanvas } from '@client/components/config/FormConfigCanvas'

enum Event {
  BIRTH = 'birth',
  DEATH = 'death',
  NONE = ''
}

type RouteProps = RouteComponentProps<{
  event: string
}>

interface IStateProps {
  scope: Scope | null
  event: Event
}

interface IDispatchProps {
  goBack: typeof goBack
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
  if (!props.scope?.includes('natlsysadmin') || props.event === Event.NONE) {
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
        <PageNavigation />
        <FormConfigCanvas />
        <FormTools />
      </WizardContainer>
    </>
  )
}

function mapStateToProps(state: IStoreState, props: RouteProps): IStateProps {
  const { event } = props.match.params
  return {
    scope: getScope(state),
    event:
      event === 'birth'
        ? Event.BIRTH
        : event === 'death'
        ? Event.DEATH
        : Event.NONE
  }
}

export const FormConfigWizard = connect<
  IStateProps,
  IDispatchProps,
  RouteProps,
  IStoreState
>(mapStateToProps, { goBack })(injectIntl(FormConfigWizardComp))
