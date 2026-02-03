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
import { useField } from 'formik'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
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
  TextField,
  ValidatorContext
} from '@opencrvs/commons/client'
import { ITextInputProps as ComponentTextInputProps } from '@opencrvs/components'
import { Text } from '@client/v2-events/features/events/registered-fields'
import { InputField } from '@client/components/form/InputField'

interface NameInputProps
  extends Omit<ComponentTextInputProps, 'onChange' | 'value'> {
  onChange: (newValue: NameFieldValue) => void
  value?: NameFieldValue
  configuration?: NameField['configuration']
  validation: FieldConfig['validation']
  validatorContext: ValidatorContext
}

const defaultValue: NameFieldValue = {
  firstname: '',
  middlename: '',
  surname: ''
}

const InputFieldWithBottomMargin = styled(InputField)`
  margin-bottom: 22px;
`

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

function NameInput(props: NameInputProps) {
  const {
    name,
    onBlur,
    onChange,
    disabled,
    error,
    touched,
    value = defaultValue,
    configuration,
    validatorContext
  } = props

  const [firstnameInput, firstnameMeta, firstnameHelper] = useField<string>(
    `${name}.firstname`
  )
  const [middlenameInput, middlenameMeta, middlenameHelper] = useField<string>(
    `${name}.middlename`
  )
  const [surnameInput, surnameMeta, surnameHelper] = useField<string>(
    `${name}.surname`
  )
  const intl = useIntl()
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

  const firstnameLabel = intl.formatMessage(
    nameConfig.firstname?.label || {
      defaultMessage: 'First name(s)',
      description: 'This is the label for the firstname field',
      id: 'field.name.firstname.label'
    }
  )
  const middlenameLabel = intl.formatMessage(
    nameConfig.middlename?.label || {
      defaultMessage: 'Middle name',
      description: 'This is the label for the middlename field',
      id: 'field.name.middlename.label'
    }
  )

  const surnameLabel = intl.formatMessage(
    nameConfig.surname?.label || {
      defaultMessage: 'Surname',
      description: 'This is the label for the surname field',
      id: 'field.name.surname.label'
    }
  )

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
      <InputFieldWithBottomMargin
        error={firstnameMeta.error}
        id={`${name}.firstname`}
        label={firstnameLabel}
        required={!!nameConfig.firstname?.required}
        touched={firstnameMeta.touched}
      >
        <Text.Input
          {...firstnameInput}
          // isDisabled={inputProps.disabled}
          type="text"
          value={firstnameMeta.value}
          onChange={(val) => onChange({ ...value, firstname: val ?? '' })}
        />
      </InputFieldWithBottomMargin>
      <InputFieldWithBottomMargin
        error={middlenameMeta.error}
        id={`${name}.middlename`}
        label={middlenameLabel}
        required={!!nameConfig.middlename?.required}
        touched={middlenameMeta.touched}
      >
        <Text.Input
          {...middlenameInput}
          // isDisabled={inputProps.disabled}
          type="text"
          value={middlenameMeta.value}
          onChange={(val) => onChange({ ...value, middlename: val ?? '' })}
        />
      </InputFieldWithBottomMargin>
      <InputFieldWithBottomMargin
        error={surnameMeta.error}
        id={`${name}.surname`}
        label={surnameLabel}
        required={!!nameConfig.surname?.required}
        touched={surnameMeta.touched}
      >
        <Text.Input
          {...surnameInput}
          // isDisabled={inputProps.disabled}
          type="text"
          value={surnameMeta.value}
          onChange={(val) => onChange({ ...value, surname: val ?? '' })}
        />
      </InputFieldWithBottomMargin>
    </>
  )
}

function NameOutput({
  value,
  configuration
}: {
  value?: NameFieldValue
  configuration?: NameField
}) {
  const defaultNameOrder = [
    'firstname',
    ...(configuration?.configuration?.name?.middlename ? ['middlename'] : []),
    'surname'
  ]
  const order = configuration?.configuration?.order || defaultNameOrder

  return joinValues(
    order.map((field) => value?.[field as keyof NameFieldValue])
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
  Output: NameOutput,
  stringify,
  toCertificateVariables
}
