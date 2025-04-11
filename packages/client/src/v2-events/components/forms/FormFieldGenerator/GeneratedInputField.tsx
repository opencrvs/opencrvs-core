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

import React, { useCallback } from 'react'
import { MessageDescriptor, useIntl } from 'react-intl'
import {
  EventState,
  FieldConfig,
  FieldValue,
  FileFieldValue,
  FileFieldWithOptionValue,
  isAddressFieldType,
  isAdministrativeAreaFieldType,
  isFacilityFieldType,
  isBulletListFieldType,
  isCheckboxFieldType,
  isCountryFieldType,
  isDateFieldType,
  isDividerFieldType,
  isFileFieldType,
  isFileFieldWithOptionType,
  isLocationFieldType,
  isOfficeFieldType,
  isPageHeaderFieldType,
  isParagraphFieldType,
  isRadioGroupFieldType,
  isSelectFieldType,
  isSignatureFieldType,
  isTextAreaFieldType,
  isTextFieldType,
  isNumberFieldType,
  isEmailFieldType,
  isDataFieldType,
  EventConfig,
  EventIndex,
  getDeclarationFields
} from '@opencrvs/commons/client'
import { TextArea } from '@opencrvs/components/lib/TextArea'
import { SignatureUploader } from '@client/components/form/SignatureField/SignatureUploader'
import { InputField } from '@client/components/form/InputField'

import {
  BulletList,
  Checkbox,
  DateField,
  RadioGroup,
  LocationSearch,
  Select,
  SelectCountry,
  Text,
  Number,
  AdministrativeArea,
  Divider,
  PageHeader,
  Paragraph
} from '@client/v2-events/features/events/registered-fields'

import { Address } from '@client/v2-events/features/events/registered-fields/Address'
import { Data } from '@client/v2-events/features/events/registered-fields/Data'
import { File } from '../inputs/FileInput/FileInput'
import { FileWithOption } from '../inputs/FileInput/DocumentUploaderWithOption'
import { makeFormikFieldIdsOpenCRVSCompatible } from './utils'

interface ExposedProps {
  fields: FieldConfig[]
  id: string
  fieldsToShowValidationErrors?: FieldConfig[]
  setAllFieldsDirty: boolean
  onChange: (values: EventState) => void
  formData: Record<string, FieldValue>
  requiredErrorMessage?: MessageDescriptor
  onUploadingStateChanged?: (isUploading: boolean) => void
  initialValues?: EventState
  eventConfig?: EventConfig
  declaration?: EventState
  readonlyMode?: boolean
}

interface GeneratedInputFieldProps<T extends FieldConfig> {
  fieldDefinition: T
  fields: FieldConfig[]
  values: EventState
  /**@todo - figure out when to use this rather than onChange handler */
  setFieldValue: (name: string, value: FieldValue | undefined) => void
  onClick?: () => void
  /**
   * onChange is not called within the Field component's onChange handler
   * onChange is called within the Field component's onBlur handler
   */
  onChange: (e: React.ChangeEvent) => void
  /**
   * onBlur is used to set the touched state of the field
   * onChange doesn't set the touched state
   */
  onBlur: (e: React.FocusEvent) => void
  resetDependentSelectValues: (name: string) => void
  value: FieldValue
  touched: boolean
  /**
   * Errors are rendered only when both error and touched are truthy
   */
  error: string
  formData: EventState
  disabled?: boolean
  onUploadingStateChanged?: (isUploading: boolean) => void
  requiredErrorMessage?: MessageDescriptor
  eventConfig?: EventConfig
  event?: EventIndex
  readonlyMode?: boolean
}

export const GeneratedInputField = React.memo(
  <T extends FieldConfig>({
    fieldDefinition,
    onChange,
    onBlur,
    setFieldValue,
    error,
    touched,
    value,
    formData,
    disabled,
    eventConfig,
    readonlyMode
  }: GeneratedInputFieldProps<T>) => {
    const intl = useIntl()

    const inputFieldProps = {
      id: fieldDefinition.id,
      // If label is hidden or default message is empty, we don't need to render label
      label:
        fieldDefinition.hideLabel || !fieldDefinition.label.defaultMessage
          ? undefined
          : intl.formatMessage(fieldDefinition.label),
      required: fieldDefinition.required,
      disabled: fieldDefinition.disabled || readonlyMode,
      error,
      touched
    }

    const inputProps = {
      id: fieldDefinition.id,
      name: fieldDefinition.id,
      onChange,
      onBlur,
      value,
      disabled: disabled || fieldDefinition.disabled || readonlyMode,
      error: Boolean(error),
      touched: Boolean(touched),
      placeholder:
        fieldDefinition.placeholder &&
        intl.formatMessage(fieldDefinition.placeholder)
    }

    const handleFileChange = useCallback(
      (val: FileFieldValue | undefined) =>
        setFieldValue(fieldDefinition.id, val),
      [fieldDefinition.id, setFieldValue]
    )

    const handleFileWithOptionChange = useCallback(
      (val: FileFieldWithOptionValue | undefined) =>
        setFieldValue(fieldDefinition.id, val),
      [fieldDefinition.id, setFieldValue]
    )

    /**
     * Combines the field definition with the current value and input field props
     * USED FOR: rendering the correct input field based on the FieldConfig guards
     */
    const field = {
      inputFieldProps,
      config: fieldDefinition,
      value
    }

    if (isDateFieldType(field)) {
      return (
        <InputField {...field.inputFieldProps}>
          <DateField.Input
            {...inputProps}
            value={field.value}
            onChange={(val: string) => setFieldValue(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }
    if (isPageHeaderFieldType(field)) {
      return (
        <PageHeader.Input>
          {intl.formatMessage(fieldDefinition.label)}
        </PageHeader.Input>
      )
    }

    if (isParagraphFieldType(field)) {
      const label = fieldDefinition.label as unknown as MessageDescriptor & {
        values: Record<string, string>
      }
      const values = label.values || {}

      const message = intl.formatMessage(label, {
        ...values,
        [fieldDefinition.id]: field.value
      })

      return (
        <Paragraph.Input
          fontVariant={field.config.configuration.styles?.fontVariant}
          message={message}
        />
      )
    }

    if (isTextFieldType(field)) {
      return (
        <InputField
          {...inputFieldProps}
          postfix={
            field.config.configuration?.postfix &&
            intl.formatMessage(field.config.configuration.postfix)
          }
          prefix={
            field.config.configuration?.prefix &&
            intl.formatMessage(field.config.configuration.prefix)
          }
        >
          <Text.Input
            type={field.config.configuration?.type ?? 'text'}
            {...inputProps}
            isDisabled={disabled}
            maxLength={field.config.configuration?.maxLength}
            value={field.value}
          />
        </InputField>
      )
    }

    if (isEmailFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <Text.Input
            type="email"
            {...inputProps}
            isDisabled={disabled}
            maxLength={field.config.configuration?.maxLength}
            value={field.value}
          />
        </InputField>
      )
    }
    if (isNumberFieldType(field)) {
      return (
        <InputField
          {...inputFieldProps}
          postfix={
            field.config.configuration?.postfix &&
            intl.formatMessage(field.config.configuration.postfix)
          }
          prefix={
            field.config.configuration?.prefix &&
            intl.formatMessage(field.config.configuration.prefix)
          }
        >
          <Number.Input
            {...inputProps}
            max={field.config.configuration?.max}
            min={field.config.configuration?.min}
            value={field.value}
            onChange={(val) => setFieldValue(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }

    if (isTextAreaFieldType(field)) {
      return (
        <InputField
          {...inputFieldProps}
          postfix={
            field.config.configuration?.postfix &&
            intl.formatMessage(field.config.configuration.postfix)
          }
          prefix={
            field.config.configuration?.prefix &&
            intl.formatMessage(field.config.configuration.prefix)
          }
        >
          <TextArea
            {...inputProps}
            maxLength={field.config.configuration?.maxLength}
            value={field.value}
          />
        </InputField>
      )
    }

    if (isFileFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <File.Input
            {...inputProps}
            acceptedFileTypes={field.config.configuration.acceptedFileTypes}
            error={inputFieldProps.error}
            maxFileSize={field.config.configuration.maxFileSize}
            value={field.value}
            width={field.config.configuration.style?.width}
            onChange={handleFileChange}
          />
        </InputField>
      )
    }
    if (isBulletListFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <BulletList.Input {...field.config} />
        </InputField>
      )
    }
    if (isAddressFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <Address.Input
            value={field.value}
            //@TODO: We need to come up with a general solution for complex types.
            // @ts-ignore
            onChange={(val) => setFieldValue(fieldDefinition.id, val)}
            {...field.config}
          />
        </InputField>
      )
    }
    if (isSelectFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <Select.Input
            {...field.config}
            value={field.value}
            onChange={(val: string) => setFieldValue(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }
    if (isCountryFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <SelectCountry.Input
            {...field.config}
            setFieldValue={setFieldValue}
            value={field.value}
          />
        </InputField>
      )
    }
    if (isCheckboxFieldType(field)) {
      return (
        <Checkbox.Input
          {...field.config}
          setFieldValue={setFieldValue}
          value={field.value}
        />
      )
    }
    if (isRadioGroupFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <RadioGroup.Input
            {...field.config}
            setFieldValue={setFieldValue}
            value={field.value}
          />
        </InputField>
      )
    }

    if (isSignatureFieldType(field)) {
      return readonlyMode ? (
        <></>
      ) : (
        <InputField {...inputFieldProps}>
          <SignatureUploader
            modalTitle={intl.formatMessage(field.config.signaturePromptLabel)}
            name={fieldDefinition.id}
            value={field.value}
            onChange={(val: string) => setFieldValue(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }

    if (isAdministrativeAreaFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <AdministrativeArea.Input
            {...field.config}
            partOf={
              (field.config.configuration.partOf?.$declaration &&
                (makeFormikFieldIdsOpenCRVSCompatible(formData)[
                  field.config.configuration.partOf.$declaration
                ] as string | undefined | null)) ??
              null
            }
            setFieldValue={setFieldValue}
            value={field.value}
          />
        </InputField>
      )
    }

    if (isLocationFieldType(field)) {
      return (
        <LocationSearch.Input
          {...field.config}
          searchableResource={['locations']}
          setFieldValue={setFieldValue}
          value={field.value}
        />
      )
    }

    if (isOfficeFieldType(field)) {
      return (
        <LocationSearch.Input
          {...field.config}
          searchableResource={['offices']}
          setFieldValue={setFieldValue}
          value={field.value}
        />
      )
    }

    if (isFacilityFieldType(field)) {
      return (
        <LocationSearch.Input
          {...field.config}
          searchableResource={['facilities']}
          setFieldValue={setFieldValue}
          value={field.value}
        />
      )
    }
    if (isDividerFieldType(field)) {
      return <Divider.Input />
    }
    if (isFileFieldWithOptionType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <FileWithOption.Input
            {...inputProps}
            acceptedFileTypes={field.config.configuration.acceptedFileTypes}
            error={inputFieldProps.error}
            maxFileSize={field.config.configuration.maxFileSize}
            options={field.config.options}
            value={field.value ?? []}
            onChange={handleFileWithOptionChange}
          />
        </InputField>
      )
    }

    if (isDataFieldType(field)) {
      // If no event config or declare form fields found, don't render the data field.
      // This should never actually happen, but we don't want to throw an error either.
      if (!eventConfig) {
        return null
      }

      return (
        <Data.Input
          {...field.config}
          declarationFields={getDeclarationFields(eventConfig)}
          formData={formData}
        />
      )
    }

    throw new Error(`Unsupported field ${JSON.stringify(fieldDefinition)}`)
  }
)

GeneratedInputField.displayName = 'MemoizedGeneratedInputField'
