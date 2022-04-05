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
import { loop, Cmd, Loop, LoopReducer } from 'redux-loop'
import { storage } from '@client/storage'
import { find } from 'lodash'
import { formDraftQueries } from './queries'
import * as actions from '@client/forms/configuration/actions'
import {
  Event,
  IQuestionConfig,
  ISerializedForm,
  IFormField,
  IForm,
  IFormSection
} from '@client/forms'
import {
  configureRegistrationForm,
  sortFormCustomisations,
  filterQuestionsByEventType
} from '@client/forms/configuration'
import { registerForms } from './default'
import { deserializeForm } from '@client/forms/mappings/deserializer'
import { GQLFormDraft } from '@opencrvs/gateway/src/graphql/schema'

export enum DraftStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  FINALISED = 'FINALISED'
}

export interface IHistory {
  version: number
  status: DraftStatus
  comment?: string
  lastUpdateAt: number
}

type IConfigFormField = {
  fieldId: string
  precedingFieldId: string | null
  foregoingFieldId: string | null
  required: boolean
  enabled: string
  custom: boolean
  definition: IFormField
}

type IFormFieldMap = Record<string, IConfigFormField>

type ISectionFieldMap = Record<string, IFormFieldMap>

export interface IDraft {
  event: Event
  status: DraftStatus
  comment?: string
  version: number
  history?: IHistory[]
  fieldsMap: ISectionFieldMap
  updatedAt: number
  createdAt: number
}

export interface IFormDraftData {
  birth: IDraft
  death: IDraft
}

export type IFormDraftDataState = {
  formDraftData: IFormDraftData | null
  formDraftDataLoaded: boolean
  loadingError: boolean
}

export const initialState: IFormDraftDataState = {
  formDraftData: null,
  formDraftDataLoaded: false,
  loadingError: false
}

function getSectionFieldsMap(event: Event, section: IFormSection) {
  let precedingFieldId: string | null = null
  return section.groups.reduce<IFormFieldMap>(
    (groupFieldMap, group) =>
      group.fields.reduce((fieldMap, field) => {
        const fieldId = [
          event.toLowerCase(),
          section.id,
          group.id,
          field.name
        ].join('.')
        /* We need to build the field regardless of the conditionals */
        delete field.conditionals
        fieldMap[fieldId] = {
          fieldId,
          precedingFieldId: precedingFieldId ? precedingFieldId : null,
          foregoingFieldId: null,
          required: field.required || false,
          enabled: field.enabled || 'enabled',
          custom: field.custom || false,
          definition: field
        }
        if (precedingFieldId) {
          fieldMap[precedingFieldId].foregoingFieldId = fieldId
        }
        precedingFieldId = fieldId
        return fieldMap
      }, groupFieldMap),
    {}
  )
}

function getEventSectionFieldsMap(form: IForm, event: Event) {
  const birthSectionFieldsMap = form.sections.reduce<ISectionFieldMap>(
    (sectionFieldsMap, section) => ({
      ...sectionFieldsMap,
      [section.id]: getSectionFieldsMap(event, section)
    }),
    {}
  )

  return birthSectionFieldsMap
}

async function saveFormDraftData(formDraftData: IFormDraftData) {
  return storage.setItem('formDraft', JSON.stringify(formDraftData))
}

export const formDraftReducer: LoopReducer<
  IFormDraftDataState,
  actions.FormDraftActions
> = (
  state: IFormDraftDataState = initialState,
  action: actions.FormDraftActions
):
  | IFormDraftDataState
  | Loop<IFormDraftDataState, actions.FormDraftActions> => {
  switch (action.type) {
    case actions.LOAD_DRAFT:
      return loop(
        state,
        Cmd.run(formDraftQueries.fetchFormDraft, {
          successActionCreator: actions.storeDraft,
          failActionCreator: actions.failedDraft
        })
      )

    case actions.STORE_DRAFT:
      const formDraftQueryData =
        action.payload.queryData.data.getFormDraft.filter(
          (draft): draft is GQLFormDraft => draft !== null
        )

      const birthFormDraft = find(formDraftQueryData, {
        event: 'birth'
      })

      const deathFormDraft = find(formDraftQueryData, {
        event: 'death'
      })

      if (!birthFormDraft) {
        throw new Error('No birth form draft found')
      }

      if (!deathFormDraft) {
        throw new Error('No death form draft found')
      }

      const configuredBirthForm: ISerializedForm = configureRegistrationForm(
        sortFormCustomisations(
          filterQuestionsByEventType(
            birthFormDraft.questions as IQuestionConfig[] | undefined,
            'birth'
          ),
          registerForms.birth
        ),
        registerForms.birth
      )

      const configuredDeathForm: ISerializedForm = configureRegistrationForm(
        sortFormCustomisations(
          filterQuestionsByEventType(
            deathFormDraft.questions as IQuestionConfig[] | undefined,
            'death'
          ),
          registerForms.death
        ),
        registerForms.death
      )

      const birthForm = deserializeForm(configuredBirthForm)
      const deathForm = deserializeForm(configuredDeathForm)

      const formDraftData = {
        birth: {
          ...birthFormDraft,
          fieldsMap: getEventSectionFieldsMap(birthForm, Event.BIRTH)
        },
        death: {
          ...deathFormDraft,
          fieldsMap: getEventSectionFieldsMap(deathForm, Event.DEATH)
        }
      } as IFormDraftData

      return loop(
        {
          ...state,
          formDraftData: formDraftData,
          formDraftDataLoaded: true
        },
        Cmd.run(saveFormDraftData, { args: [state.formDraftData] })
      )
    case actions.FAILED_DRAFT:
      return {
        ...state,
        loadingError: true
      }
    default:
      return state
  }
}
