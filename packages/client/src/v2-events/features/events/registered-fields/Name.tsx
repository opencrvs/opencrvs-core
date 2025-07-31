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
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  FieldConfig,
  FieldType,
  getValidatorsForField,
  joinValues,
  NameConfig,
  NameFieldValue,
  TextField
} from '@opencrvs/commons/client'
import { mergeWithoutNullsOrUndefined } from '@client/v2-events/utils'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'

interface Props {
  id: string
  onChange: (newValue: NameFieldValue) => void
  maxLength?: number
  validation: FieldConfig['validation']
  value?: NameFieldValue
  nameConfig?: NameConfig
  searchMode?: boolean
}

const defailtNameFieldValue: NameFieldValue = {
  firstname: '',
  middlename: '',
  surname: ''
}

function FocusNameInputsOnHash({
  id,
  value
}: {
  id: string
  value?: { firstname?: string; middlename?: string; surname?: string }
}) {
  const location = useLocation()

  useEffect(() => {
    if (location.hash !== `#${id}`) {
      return
    }

    const containerId = `${id}-form-input`
    const container = document.getElementById(containerId)
    if (!container) {
      return
    }

    const tryFocus = () => {
      const firstNameInput = container.querySelector<HTMLInputElement>(
        'input[id$="firstname"]'
      )
      const middleNameInput = container.querySelector<HTMLInputElement>(
        'input[id$="middlename"]'
      )
      const surnameInput = container.querySelector<HTMLInputElement>(
        'input[id$="surname"]'
      )

      if (firstNameInput && !value?.firstname) {
        firstNameInput.focus()
        return true
      } else if (middleNameInput && !value?.middlename) {
        middleNameInput.focus()
        return true
      } else if (surnameInput && !value?.surname) {
        surnameInput.focus()
        return true
      } else if (firstNameInput) {
        firstNameInput.focus()
        return true
      }

      return false
    }

    // First try without waiting
    const focused = tryFocus()
    if (focused) {
      return
    }

    // If not focused, observe DOM changes
    const observer = new MutationObserver(() => {
      if (tryFocus()) {
        observer.disconnect()
      }
    })

    observer.observe(container, {
      childList: true,
      subtree: true
    })

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, id])

  return null
}

function NameInput(props: Props) {
  const {
    id,
    onChange,
    value = {},
    maxLength,
    nameConfig = {
      firstname: { required: true },
      surname: { required: true }
    },
    searchMode = false
  } = props
  const validators = props.validation || []

  const fields: TextField[] = [
    ...(nameConfig.firstname
      ? [
          {
            id: 'firstname',
            type: FieldType.TEXT,
            configuration: {
              maxLength
            },
            required: !searchMode && nameConfig.firstname.required,
            label: {
              defaultMessage: 'First name(s)',
              description: 'This is the label for the firstname field',
              id: 'v2.field.name.firstname.label'
            },
            validation: getValidatorsForField('firstname', validators)
          }
        ]
      : []),
    ...(nameConfig.middlename
      ? [
          {
            id: 'middlename',
            type: FieldType.TEXT,
            configuration: {
              maxLength
            },
            required: !searchMode && nameConfig.middlename.required,
            label: {
              defaultMessage: 'Middle name',
              description: 'This is the label for the middlename field',
              id: 'v2.field.name.middlename.label'
            },
            validation: getValidatorsForField('middlename', validators)
          }
        ]
      : []),
    ...(nameConfig.surname
      ? [
          {
            id: 'surname',
            type: FieldType.TEXT,
            required: !searchMode && nameConfig.surname.required,
            configuration: {
              maxLength
            },
            label: {
              defaultMessage: 'Last name',
              description: 'This is the label for the surname field',
              id: 'v2.field.name.surname.label'
            },
            validation: getValidatorsForField('surname', validators)
          }
        ]
      : [])
  ]

  return (
    <>
      <FormFieldGenerator
        fields={fields}
        id={id}
        initialValues={{ ...value }}
        parentId={id}
        onChange={(values) => {
          if (searchMode) {
            // when in search mode, we initialize empty name fields with empty string
            // to avoid name field validation
            values = mergeWithoutNullsOrUndefined(defailtNameFieldValue, values)
          }
          onChange(values as NameFieldValue)
        }}
      />
      <FocusNameInputsOnHash id={id} value={value} />
    </>
  )
}

function stringify(value?: NameFieldValue) {
  return joinValues([value?.firstname, value?.middlename, value?.surname])
}

export const Name = {
  Input: NameInput,
  Output: ({ value }: { value?: NameFieldValue }) => (
    <>{joinValues([value?.firstname, value?.middlename, value?.surname])}</>
  ),
  stringify
}
