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
import { useDispatch, useSelector } from 'react-redux'
import { IntlShape, useIntl } from 'react-intl'
import { Redirect, useParams } from 'react-router'
import { HOME } from '@client/navigation/routes'
import { EventTopBar } from '@opencrvs/components/lib/interface'
import { SettingsBlue } from '@opencrvs/components/lib/icons'
import {
  SecondaryButton,
  SuccessButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import styled from '@client/styledComponents'
import { SectionNavigation } from '@client/components/formConfig/SectionNavigation'
import { FormTools } from '@client/components/formConfig/formTools/FormTools'
import { Event, BirthSection, DeathSection } from '@client/forms'
import { buttonMessages } from '@client/i18n/messages'
import { Canvas } from '@client/components/formConfig/Canvas'
import { selectEventFormDraft } from '@client/forms/configuration/selector'
import { IConfigFormField } from '@client/forms/configuration/configFields/utils'
import { DefaultFieldTools } from '@client/components/formConfig/formTools/DefaultFieldTools'
import { useLoadFormDraft, useHasNatlSysAdminScope } from './hooks'
import { constantsMessages } from '@client/i18n/messages/constants'
import { IStoreState } from '@client/store'
import { goToFormConfig, goToFormConfigSettings } from '@client/navigation'
import { Dispatch } from 'redux'

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

type IRouteProps = {
  event: Event
  section: string
}

const topBarActions = (intl: IntlShape, dispatch: Dispatch) => {
  return [
    <TertiaryButton
      id="settings"
      icon={() => <SettingsBlue />}
      onClick={() => dispatch(goToFormConfigSettings())}
    ></TertiaryButton>,
    <SecondaryButton key="save" size="small" onClick={() => {}}>
      {intl.formatMessage(buttonMessages.save)}
    </SecondaryButton>,
    <SuccessButton key="publish" size="small" onClick={() => {}}>
      {intl.formatMessage(buttonMessages.publish)}
    </SuccessButton>
  ]
}

function isValidEvent(event: string): event is Event {
  return Object.values<string>(Event).includes(event)
}

function isValidSection(
  section: string
): section is BirthSection | DeathSection {
  return [
    ...Object.values<string>(BirthSection),
    ...Object.values<string>(DeathSection)
  ].includes(section)
}

function useNewDraftVersion(event: Event) {
  const formDraft = useSelector((store: IStoreState) =>
    selectEventFormDraft(store, event)
  )
  return (formDraft?.version || 0) + 1
}

export function FormConfigWizard() {
  useLoadFormDraft()
  const [selectedField, setSelectedField] =
    React.useState<IConfigFormField | null>(null)
  const hasNatlSysAdminScope = useHasNatlSysAdminScope()
  const dispatch = useDispatch()
  const intl = useIntl()
  const { event, section } = useParams<IRouteProps>()
  const version = useNewDraftVersion(event)

  if (
    !hasNatlSysAdminScope ||
    !isValidEvent(event) ||
    !isValidSection(section)
  ) {
    return <Redirect to={HOME} />
  }

  return (
    <Container>
      <EventTopBar
        title={`${intl.formatMessage(constantsMessages[event])} v${version}`}
        pageIcon={<></>}
        topBarActions={topBarActions(intl, dispatch)}
        goHome={() => dispatch(goToFormConfig())}
      />
      <WizardContainer>
        <NavigationContainer>
          <SectionNavigation event={event} section={section} />
        </NavigationContainer>
        <CanvasContainer>
          <Canvas
            event={event}
            section={section}
            selectedField={selectedField}
            onFieldSelect={(field) => setSelectedField(field)}
          />
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
