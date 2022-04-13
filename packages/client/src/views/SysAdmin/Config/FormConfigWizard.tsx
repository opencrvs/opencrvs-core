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
import { connect, useDispatch } from 'react-redux'
import { IStoreState } from '@client/store'
import { getScope } from '@client/profile/profileSelectors'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  IntlShape
} from 'react-intl'
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
import { Event } from '@client/forms'
import { buttonMessages } from '@client/i18n/messages'
import { hasNatlSysAdminScope } from '@client/utils/authUtils'
import { Canvas } from '@client/components/formConfig/Canvas'
import { isFormDraftLoaded } from '@client/forms/configuration/selector'
import { loadFormDraft } from '@client/forms/configuration/actions'
import { IConfigFormField } from '@client/forms/configuration/formDraftUtils'
import { DefaultFieldTools } from '@client/components/formConfig/formTools/DefaultFieldTools'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`

const WizardContainer = styled.div`
  margin-top: 56px;
  height: calc(100% - 56px);
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const NavigationContainer = styled.div`
  width: 250px;
  flex-shrink: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
`

const ToolsContainer = styled.div`
  width: 348px;
  flex-shrink: 0;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 30px;
  border-left: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
`

const CanvasContainer = styled.div`
  overflow-y: auto;
  flex: 0 1 800px;
  margin-left: 40px;
  margin-right: 40px;
  margin-top: 18px;
`

type IFullProps = ReturnType<typeof mapStateToProps> &
  typeof dispatchProps &
  IntlShapeProps &
  IRouteProps

const topBarActions = (intl: IntlShape) => {
  return [
    <SettingsBlue key="settings" onClick={() => {}} />,
    <SecondaryButton key="save" size="small" onClick={() => {}}>
      {intl.formatMessage(buttonMessages.save)}
    </SecondaryButton>,
    <SuccessButton key="publish" size="small" onClick={() => {}}>
      {intl.formatMessage(buttonMessages.publish)}
    </SuccessButton>
  ]
}

function useLoadFormDraft(loadDrafts: typeof loadFormDraft) {
  React.useEffect(() => {
    loadDrafts()
  }, [loadDrafts])
}

function FormConfigWizardComp({
  scope,
  event,
  formDraftLoaded,
  loadFormDraft,
  intl,
  section,
  goBack
}: IFullProps) {
  const [selectedField, setSelectedField] =
    React.useState<IConfigFormField | null>(null)

  useLoadFormDraft(loadFormDraft)

  if (!(scope && hasNatlSysAdminScope(scope)) || !event || !section) {
    return <Redirect to={HOME} />
  }

  return (
    <Container>
      <EventTopBar
        title={'Birth v0.1'}
        pageIcon={<></>}
        topBarActions={topBarActions(intl)}
        goHome={() => goBack()}
      />
      <WizardContainer>
        <NavigationContainer>
          <PageNavigation event={event} section={section} />
        </NavigationContainer>
        <CanvasContainer>
          {formDraftLoaded && (
            <Canvas
              event={event}
              section={section}
              selectedField={selectedField}
              onFieldSelect={(fieldId) => setSelectedField(fieldId)}
            />
          )}
        </CanvasContainer>
        <ToolsContainer>
          {selectedField ? (
            !selectedField.definition.custom && (
              <DefaultFieldTools configField={selectedField} />
            )
          ) : (
            <FormTools />
          )}
        </ToolsContainer>
      </WizardContainer>
    </Container>
  )
}

type IRouteProps = RouteComponentProps<{
  event: string
  section: string
}>

function mapStateToProps(state: IStoreState, props: IRouteProps) {
  const { event, section: sectionKey } = props.match.params
  let section: string | undefined
  if (sectionKey in TAB_BIRTH && event === Event.BIRTH) {
    section = TAB_BIRTH[sectionKey as keyof typeof TAB_BIRTH]
  } else if (sectionKey in TAB_DEATH && event === Event.DEATH) {
    section = TAB_DEATH[sectionKey as keyof typeof TAB_DEATH]
  }
  return {
    scope: getScope(state),
    event:
      event === Event.BIRTH
        ? Event.BIRTH
        : event === Event.DEATH
        ? Event.DEATH
        : undefined,
    section,
    formDraftLoaded: isFormDraftLoaded(state)
  }
}

const dispatchProps = {
  goBack,
  loadFormDraft
}

export const FormConfigWizard = connect(
  mapStateToProps,
  dispatchProps
)(injectIntl(FormConfigWizardComp))
