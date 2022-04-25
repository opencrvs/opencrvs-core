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
import { Canvas } from '@client/components/formConfig/Canvas'
import { CustomFieldForms } from '@client/components/formConfig/CustomFieldForm'
import { DefaultFieldTools } from '@client/components/formConfig/formTools/DefaultFieldTools'
import { FormTools } from '@client/components/formConfig/formTools/FormTools'
import { SectionNavigation } from '@client/components/formConfig/SectionNavigation'
import { BirthSection, DeathSection, Event, IFormField } from '@client/forms'
import { AddCustomField } from '@client/forms/configuration/configFields/actions'
import { IEventTypes } from '@client/forms/configuration/configFields/reducer'
import {
  IConfigFormField,
  ICustomFieldAttribute,
  prepareNewCustomFieldConfig
} from '@client/forms/configuration/configFields/utils'
import { DEFAULT_TEXT } from '@client/forms/configuration/default'
import { selectEventFormDraft } from '@client/forms/configuration/selector'
import { buttonMessages } from '@client/i18n/messages'
import { constantsMessages } from '@client/i18n/messages/constants'
import { getDefaultLanguage } from '@client/i18n/utils'
import { goToFormConfig } from '@client/navigation'
import { HOME } from '@client/navigation/routes'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import {
  SecondaryButton,
  SuccessButton
} from '@opencrvs/components/lib/buttons'
import { SettingsBlue } from '@opencrvs/components/lib/icons'
import { EventTopBar } from '@opencrvs/components/lib/interface'
import React from 'react'
import { IntlShape, useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router'
import { useHasNatlSysAdminScope, useLoadFormDraft } from './hooks'

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
  overflow-y: auto;
`

const CanvasContainer = styled.div`
  overflow-y: auto;
  flex: 0 1 800px;
  margin-left: 40px;
  margin-right: 40px;
  margin-top: 18px;
`

const CanvasWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

type IRouteProps = {
  event: Event
  section: string
}

const DEFAULT_CUSTOM_FIELD_ATTRIBUTE: ICustomFieldAttribute = {
  label: [
    {
      lang: getDefaultLanguage(),
      descriptor: DEFAULT_TEXT.label
    }
  ]
}

const customField: IConfigFormField = {
  fieldId: 'customField',
  precedingFieldId: null,
  foregoingFieldId: null,
  required: false,
  enabled: 'enabled',
  custom: true,
  customizedFieldAttributes: DEFAULT_CUSTOM_FIELD_ATTRIBUTE,
  definition: {
    ...DEFAULT_TEXT
  }
}

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
  const state = useSelector((store: IStoreState) => store.configFields)

  if (
    !hasNatlSysAdminScope ||
    !isValidEvent(event) ||
    !isValidSection(section)
  ) {
    return <Redirect to={HOME} />
  }

  if (
    selectedField &&
    undefined === (state as IEventTypes)[event][section][selectedField.fieldId]
  ) {
    setSelectedField(null)
  }

  return (
    <Container>
      <EventTopBar
        title={`${intl.formatMessage(constantsMessages[event])} v${version}`}
        pageIcon={<></>}
        topBarActions={topBarActions(intl)}
        goHome={() => dispatch(goToFormConfig())}
      />
      <WizardContainer>
        <NavigationContainer>
          <SectionNavigation
            event={event}
            section={section}
            onSectionChange={setSelectedField}
          />
        </NavigationContainer>
        <CanvasWrapper onClick={() => setSelectedField(null)}>
          <CanvasContainer>
            <Canvas
              event={event}
              section={section}
              selectedField={selectedField}
              onFieldSelect={(field) => setSelectedField(field)}
            />
          </CanvasContainer>
        </CanvasWrapper>
        <ToolsContainer>
          {selectedField ? (
            !selectedField.custom ? (
              <DefaultFieldTools configField={selectedField} />
            ) : (
              <CustomFieldForms
                key={selectedField.fieldId}
                selectedField={selectedField}
              />
            )
          ) : (
            <FormTools
              onAddClickListener={(fieldType: string) => {
                const modifiedFieldMap = {
                  ...customField,
                  definition: {
                    ...customField.definition,
                    type: fieldType as IFormField['type']
                  }
                } as IConfigFormField

                const customFieldConfig = prepareNewCustomFieldConfig(
                  state as IEventTypes,
                  event,
                  section,
                  modifiedFieldMap
                )
                if (!customFieldConfig) {
                  return
                }
                dispatch(AddCustomField(event, section, customFieldConfig))
                setSelectedField(customFieldConfig)
                setTimeout(() => {
                  document
                    .getElementById(customFieldConfig.fieldId)
                    ?.scrollIntoView()
                }, 300)
              }}
            />
          )}
        </ToolsContainer>
      </WizardContainer>
    </Container>
  )
}
