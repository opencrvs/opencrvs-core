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
  alwaysTrue,
  ConditionalType,
  FieldConfig,
  FieldType,
  getValidatorsForField,
  joinValues,
  NameField,
  NameFieldValue,
  not,
  TextField
} from '@opencrvs/commons/client'
import { mergeWithoutNullsOrUndefined } from '@client/v2-events/utils'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'

interface Props {
  id: string
  onChange: (newValue: NameFieldValue) => void
  configuration?: NameField['configuration']
  validation: FieldConfig['validation']
  value?: NameFieldValue
  disabled?: boolean
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
  const { id, onChange, disabled, value = {}, configuration } = props

  const { maxLength, order } = configuration || {}

  const nameConfig = configuration?.name || {
    firstname: { required: true },
    surname: { required: true }
  }

  const defaultNameOrder = [
    'firstname',
    ...(nameConfig.middlename ? ['middlename'] : []),
    'surname'
  ]

  const validators = props.validation || []
  const nameOrder = order || defaultNameOrder

  const fields: TextField[] = nameOrder.map((field) => {
    switch (field) {
      case 'firstname':
        return {
          id: 'firstname',
          type: FieldType.TEXT,
          configuration: { maxLength },
          required: nameConfig.firstname?.required,
          conditionals: [
            {
              type: ConditionalType.ENABLE,
              conditional: disabled ? not(alwaysTrue()) : not(not(alwaysTrue()))
            }
          ],
          label: nameConfig.firstname?.label || {
            defaultMessage: 'First name(s)',
            description: 'This is the label for the firstname field',
            id: 'field.name.firstname.label'
          },
          validation: getValidatorsForField('firstname', validators)
        } satisfies TextField
      case 'middlename':
        return {
          id: 'middlename',
          type: FieldType.TEXT,
          configuration: { maxLength },
          required: nameConfig.middlename?.required,
          conditionals: [
            {
              type: ConditionalType.ENABLE,
              conditional: disabled ? not(alwaysTrue()) : not(not(alwaysTrue()))
            }
          ],
          label: nameConfig.middlename?.label || {
            defaultMessage: 'Middle name',
            description: 'This is the label for the middlename field',
            id: 'field.name.middlename.label'
          },
          validation: getValidatorsForField('middlename', validators)
        }
      case 'surname':
        return {
          id: 'surname',
          type: FieldType.TEXT,
          required: nameConfig.surname?.required,
          conditionals: [
            {
              type: ConditionalType.ENABLE,
              conditional: disabled ? not(alwaysTrue()) : not(not(alwaysTrue()))
            }
          ],
          configuration: { maxLength },
          label: nameConfig.surname?.label || {
            defaultMessage: 'Last name',
            description: 'This is the label for the surname field',
            id: 'field.name.surname.label'
          },
          validation: getValidatorsForField('surname', validators)
        }
      default:
        throw new Error(`Unknown field type: ${field}`)
    }
  })

  return (
    <>
      <FormFieldGenerator
        fields={fields}
        id={id}
        initialValues={{ ...value }}
        parentId={id}
        onChange={(values) => {
          onChange(mergeWithoutNullsOrUndefined(defailtNameFieldValue, values))
        }}
      />
      <FocusNameInputsOnHash id={id} value={value} />
    </>
  )
}

function stringify(value?: NameFieldValue) {
  return joinValues([value?.firstname, value?.middlename, value?.surname])
}

function toCertificateVariables(value?: NameFieldValue) {
  return {
    fullname: stringify(value),
    firstname: value?.firstname,
    middlename: value?.middlename,
    surname: value?.surname
  }
}

export const Name = {
  Input: NameInput,
  Output: ({
    value,
    configuration
  }: {
    value?: NameFieldValue
    configuration?: NameField
  }) => {
    const defaultNameOrder = [
      'firstname',
      ...(configuration?.configuration?.name?.middlename ? ['middlename'] : []),
      'surname'
    ]
    const order = configuration?.configuration?.order || defaultNameOrder

    return joinValues(
      order.map((field) => value?.[field as keyof NameFieldValue])
    )
  },
  stringify,
  toCertificateVariables
}
