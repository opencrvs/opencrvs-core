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
import { ICustomConfigField } from './utils'
import { IQuestionConfig, Event } from '@client/forms'
import { IDraft } from '@client/forms/configuration/formDrafts/reducer'

export const UPDATE_CONFIG_FIELDS = 'FORM/UPDATE_CONFIG_FIELDS'
export type UpdateConfigFieldsAction = {
  type: typeof UPDATE_CONFIG_FIELDS
  payload: {
    questionConfig: IQuestionConfig[]
  }
}

export const updateConfigFields = (
  questionConfig: IQuestionConfig[]
): UpdateConfigFieldsAction => ({
  type: UPDATE_CONFIG_FIELDS,
  payload: {
    questionConfig
  }
})

export const GET_STORAGE_CONFIG_FIELDS_SUCCESS =
  'FORM/GET_STORAGE_CONFIG_FIELDS_SUCCESS'
export type GetStorageConfigFieldsSuccessAction = {
  type: typeof GET_STORAGE_CONFIG_FIELDS_SUCCESS
  payload?: string
}

export const getStorageConfigFieldsSuccess = (
  response?: string
): GetStorageConfigFieldsSuccessAction => ({
  type: GET_STORAGE_CONFIG_FIELDS_SUCCESS,
  payload: response
})

export const GET_STORAGE_CONFIG_FIELDS_FAILED =
  'FORM/GET_STORAGE_CONFIG_FIELDS_FAILED'
export type GetStorageConfigFieldsFailedAction = {
  type: typeof GET_STORAGE_CONFIG_FIELDS_FAILED
  payload?: string
}

export const getStorageConfigFieldsFailed = (
  response?: string
): GetStorageConfigFieldsFailedAction => ({
  type: GET_STORAGE_CONFIG_FIELDS_FAILED,
  payload: response
})

export const STORE_CONFIG_FIELDS_SUCCESS = 'FORM/STORE_CONFIG_FIELDS_SUCCESS'
export type StoreConfigFieldsSuccessAction = {
  type: typeof STORE_CONFIG_FIELDS_SUCCESS
  payload: string
}

export const storeConfigFieldsSuccess = (
  response: string
): StoreConfigFieldsSuccessAction => ({
  type: STORE_CONFIG_FIELDS_SUCCESS,
  payload: response
})

export const STORE_CONFIG_FIELDS_FAILED = 'FORM/STORE_CONFIG_FIELDS_SUCCESS'
export type StoreConfigFieldsFailedAction = {
  type: typeof STORE_CONFIG_FIELDS_FAILED
  payload: string
}

export const storeConfigFieldsFailed = (
  response: string
): StoreConfigFieldsFailedAction => ({
  type: STORE_CONFIG_FIELDS_FAILED,
  payload: response
})

export const ADD_CUSTOM_FIELD = 'FORM/ADD_CUSTOM_FIELD'
export type AddCustomFieldAction = {
  type: typeof ADD_CUSTOM_FIELD
  payload: {
    event: Event
    section: string
    customField: ICustomConfigField
  }
}
export const addCustomField = (
  event: Event,
  section: string,
  customField: ICustomConfigField
): AddCustomFieldAction => ({
  type: ADD_CUSTOM_FIELD,
  payload: {
    event,
    section,
    customField
  }
})

export const MODIFY_CUSTOM_FIELD = 'FORM/MODIFY_CUSTOM_FIELD'
export type ModifyCustomFieldAction = {
  type: typeof MODIFY_CUSTOM_FIELD
  payload: {
    originalField: ICustomConfigField
    modifiedField: ICustomConfigField
  }
}

export const modifyCustomField = (
  originalField: ICustomConfigField,
  modifiedField: ICustomConfigField
): ModifyCustomFieldAction => ({
  type: MODIFY_CUSTOM_FIELD,
  payload: {
    originalField,
    modifiedField
  }
})

export const REMOVE_CUSTOM_FIELD = 'FORM/REMOVE_CUSTOM_FIELD'
export type RemoveCustomFieldAction = {
  type: typeof REMOVE_CUSTOM_FIELD
  payload: {
    fieldId: string
  }
}

export const removeCustomField = (
  fieldId: string
): RemoveCustomFieldAction => ({
  type: REMOVE_CUSTOM_FIELD,
  payload: {
    fieldId
  }
})

export const UPDATE_QUESTION_CONFIG = 'FORM/UPDATE_QUESTION_CONFIG'
export type UpdateQuestionsAction = {
  type: typeof UPDATE_QUESTION_CONFIG
  payload: {
    formDraft: IDraft
    questionConfig: IQuestionConfig[]
  }
}

export const updateQuestionConfig = (
  formDraft: IDraft,
  questionConfig: IQuestionConfig[]
): UpdateQuestionsAction => ({
  type: UPDATE_QUESTION_CONFIG,
  payload: {
    formDraft,
    questionConfig
  }
})

export type ConfigFieldsActions =
  | UpdateConfigFieldsAction
  | StoreConfigFieldsSuccessAction
  | GetStorageConfigFieldsSuccessAction
  | GetStorageConfigFieldsFailedAction
  | AddCustomFieldAction
  | ModifyCustomFieldAction
  | RemoveCustomFieldAction
  | UpdateQuestionsAction
