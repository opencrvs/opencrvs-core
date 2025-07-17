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
import {
  IFormData,
  IFormField,
  IFormFieldValue,
  IFormSectionData,
  IHttpFormField,
  Ii18nLinkButtonFormField
} from '@client/forms'
import { evalExpressionInFieldDefinition } from '@client/forms/utils'
import { getOfflineData } from '@client/offline/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHttp } from './http'
import { Button, getTheme, Icon } from '@opencrvs/components'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import { useParams } from 'react-router-dom'
import { useDeclaration } from '@client/declarations/selectors'
import {
  writeDeclaration,
  writeDeclarationByUserWithoutStateUpdate
} from '@client/declarations'
import { merge } from 'lodash'
import { FormSectionComponent } from './FormFieldGenerator'

export const LinkButtonField = ({
  fields,
  form,
  draft,
  fieldDefinition,
  setFieldValue,
  isDisabled
}: {
  fields: IFormField[]
  form: IFormSectionData
  draft: IFormData
  fieldDefinition: Ii18nLinkButtonFormField
  setFieldValue: (name: string, value: IFormFieldValue) => void
  isDisabled?: boolean
}) => {
  const config = useSelector(getOfflineData)
  const user = useSelector(getUserDetails)
  const windowSize = useWindowSize()
  const theme = getTheme()
  const {
    options: {
      url: to,
      callback: { params }
    }
  } = fieldDefinition
  const trigger = fields.find(
    (f) => f.name === fieldDefinition.options.callback.trigger
  )!
  const { declarationId = '', pageId: section } = useParams()
  const declaration = useDeclaration(declarationId)
  const dispatch = useDispatch()
  const userId = useSelector(getUserDetails)?.id
  const onChange: Parameters<typeof useHttp>[1] = async ({
    data,
    error,
    loading
  }) => {
    setFieldValue(trigger.name, { loading, data, error } as IFormFieldValue)
    if (data || error) {
      if (section && declaration && userId) {
        /**
         * As we are redirecting to a new page with window.location.replace and
         * this pushes a new entry to the browser's history stack, when the user
         * clicks the back button and returns to the form, the app reloads, the state of the form
         * will be lost. To avoid this, we are updating the declaration in the
         * store with the updated values of the form fields. This will ensure that
         * the form state is preserved when the user returns to the form after
         * clicking the back button.
         * The user experience can be seen here:
         * https://github.com/opencrvs/opencrvs-core/issues/9096#issuecomment-2804381010
         * @todo we should improve this user experience
         */
        const updatedFormData =
          FormSectionComponent.getUpdatedValuesAfterDependentFieldEvaluation(
            form,
            fields,
            trigger.name,
            { loading, data, error } as IFormFieldValue,
            { config, draft, user }
          )
        writeDeclarationByUserWithoutStateUpdate(userId, {
          ...declaration,
          data: {
            ...declaration.data,
            [section]: merge(declaration.data[section], updatedFormData)
          }
        })
      }
      // remove query parameters from the URL after successful or failed callback request
      const url = new URL(window.location.href)
      url.search = '' // Remove all query parameters
      window.history.replaceState({}, document.title, url)
    }
  }

  const hasCallbackRequestBeenMade = useRef(false)

  const { call } = useHttp<string>(
    trigger as IHttpFormField,
    onChange,
    form,
    config,
    draft,
    user
  )

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    function checkParamsPresentInURL() {
      for (const [key, value] of Object.entries(params)) {
        if (urlParams.get(key) !== value) {
          return false
        }
      }
      return true
    }
    if (checkParamsPresentInURL() && !hasCallbackRequestBeenMade.current) {
      call({
        // forward params which are received after redirection to the callback request
        params: Object.fromEntries(urlParams)
      })
      hasCallbackRequestBeenMade.current = true
    }
  }, [call, params, form, trigger, hasCallbackRequestBeenMade])
  return (
    <Button
      type="secondary"
      size="large"
      element="a"
      fullWidth
      disabled={isDisabled}
      onClick={() => {
        if (declaration) {
          dispatch(
            writeDeclaration(declaration, () => {
              window.location.replace(
                evalExpressionInFieldDefinition(
                  '`' + decodeURIComponent(to) + '`',
                  form,
                  config,
                  draft,
                  user
                )
              )
            })
          )
        }
      }}
    >
      {fieldDefinition.icon &&
        (windowSize.width <= theme.grid.breakpoints.md ? (
          <Icon name={fieldDefinition.icon.mobile} size="medium" />
        ) : (
          <Icon name={fieldDefinition.icon.desktop} size="medium" />
        ))}
      {fieldDefinition.label}
    </Button>
  )
}
