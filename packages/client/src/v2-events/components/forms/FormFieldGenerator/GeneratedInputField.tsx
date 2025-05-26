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
import { useIntl } from 'react-intl'
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
  isDateRangeFieldType,
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
  getDeclarationFields,
  isNameFieldType,
  isPhoneFieldType,
  isIdFieldType
} from '@opencrvs/commons/client'
import { TextArea } from '@opencrvs/components/lib/TextArea'
import { NameFieldValue } from '@opencrvs/commons/client'
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
import { File } from '@client/v2-events/components/forms/inputs/FileInput/FileInput'
import { FileWithOption } from '@client/v2-events/components/forms/inputs/FileInput/DocumentUploaderWithOption'
import { DateRangeField } from '@client/v2-events/features/events/registered-fields/DateRangeField'
import { Name } from '@client/v2-events/features/events/registered-fields/Name'
import { makeFormikFieldIdsOpenCRVSCompatible } from './utils'

interface GeneratedInputFieldProps<T extends FieldConfig> {
  fieldDefinition: T
  /** non-native onChange. Updates Formik state by updating the value and its dependencies */
  onFieldValueChange: (name: string, value: FieldValue | undefined) => void
  /**
   * onBlur is used to set the touched state of the field
   */
  onBlur: (e: React.FocusEvent) => void
  value: FieldValue
  touched: boolean
  /**
   * Errors are rendered only when both error and touched are truthy
   */
  error: string
  form: EventState
  disabled?: boolean
  eventConfig?: EventConfig
  readonlyMode?: boolean
}

export const GeneratedInputField = React.memo(
  <T extends FieldConfig>({
    fieldDefinition,
    onBlur,
    onFieldValueChange,
    error,
    touched,
    value,
    form,
    disabled,
    eventConfig,
    readonlyMode
  }: GeneratedInputFieldProps<T>) => {
    const intl = useIntl()
    // If label is hidden or default message is empty, we don't need to render label
    const label =
      fieldDefinition.hideLabel || !fieldDefinition.label.defaultMessage
        ? undefined
        : intl.formatMessage(fieldDefinition.label)

    const inputFieldProps = {
      id: fieldDefinition.id,
      // If label is hidden or default message is empty, we don't need to render label
      label,
      required: fieldDefinition.required,
      disabled: readonlyMode,
      error,
      touched
    }

    const inputProps = {
      id: fieldDefinition.id,
      name: fieldDefinition.id,
      onBlur,
      value,
      disabled: disabled || readonlyMode,
      error: Boolean(error),
      touched,
      placeholder:
        fieldDefinition.placeholder &&
        intl.formatMessage(fieldDefinition.placeholder)
    }

    const handleFileChange = useCallback(
      (val: FileFieldValue | undefined) =>
        onFieldValueChange(fieldDefinition.id, val),
      [fieldDefinition.id, onFieldValueChange]
    )

    const handleFileWithOptionChange = useCallback(
      (val: FileFieldWithOptionValue | undefined) =>
        onFieldValueChange(fieldDefinition.id, val),
      [fieldDefinition.id, onFieldValueChange]
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

    if (isNameFieldType(field)) {
      return (
        <InputField {...field.inputFieldProps}>
          <Name.Input
            maxLength={field.config.configuration?.maxLength}
            value={field.value}
            onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }

    if (isPhoneFieldType(field)) {
      return (
        <InputField {...field.inputFieldProps}>
          <Text.Input
            {...inputProps}
            isDisabled={disabled}
            type="text"
            value={field.value}
            onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }

    if (isIdFieldType(field)) {
      return (
        <InputField {...field.inputFieldProps}>
          <Text.Input
            {...inputProps}
            isDisabled={disabled}
            type="text"
            value={field.value}
            onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }

    if (isDateFieldType(field)) {
      return (
        <InputField {...field.inputFieldProps}>
          <DateField.Input
            {...inputProps}
            value={field.value}
            onChange={(val: string) =>
              onFieldValueChange(fieldDefinition.id, val)
            }
          />
        </InputField>
      )
    }

    if (isDateRangeFieldType(field)) {
      return (
        <InputField {...field.inputFieldProps}>
          <DateRangeField.Input
            {...inputProps}
            value={field.value}
            onChange={(val) => {
              //@TODO: We need to come up with a general solution for complex types.
              // @ts-ignore
              onFieldValueChange(fieldDefinition.id, val)
            }}
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
      // @todo: is this even needed?
      const message = intl.formatMessage(fieldDefinition.label, {
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
            {...inputProps}
            isDisabled={disabled}
            maxLength={field.config.configuration?.maxLength}
            type={field.config.configuration?.type ?? 'text'}
            value={field.value}
            onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }

    if (isEmailFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <Text.Input
            {...inputProps}
            isDisabled={disabled}
            maxLength={field.config.configuration?.maxLength}
            type="email"
            value={field.value}
            onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
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
            onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
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
            onChange={(e) =>
              onFieldValueChange(fieldDefinition.id, e.target.value)
            }
          />
        </InputField>
      )
    }

    if (isFileFieldType(field)) {
      const uploadedFileNameLabel = field.config.configuration.fileName
        ? intl.formatMessage(field.config.configuration.fileName)
        : intl.formatMessage(field.config.label)

      return (
        <InputField {...inputFieldProps}>
          <File.Input
            {...inputProps}
            acceptedFileTypes={field.config.configuration.acceptedFileTypes}
            error={inputFieldProps.error}
            label={uploadedFileNameLabel}
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
            {...field.config}
            value={field.value}
            //@TODO: We need to come up with a general solution for complex types.
            // @ts-ignore
            onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
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
            onChange={(val: string) =>
              onFieldValueChange(fieldDefinition.id, val)
            }
          />
        </InputField>
      )
    }
    if (isCountryFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <SelectCountry.Input
            {...field.config}
            value={field.value}
            onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }
    if (isCheckboxFieldType(field)) {
      return (
        <Checkbox.Input
          {...field.config}
          value={field.value}
          onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
        />
      )
    }
    if (isRadioGroupFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <RadioGroup.Input
            {...field.config}
            value={field.value}
            onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }

    if (isSignatureFieldType(field)) {
      return readonlyMode ? null : (
        <InputField {...inputFieldProps}>
          <SignatureUploader
            modalTitle={intl.formatMessage(field.config.signaturePromptLabel)}
            name={fieldDefinition.id}
            value={field.value}
            onChange={(val: string) =>
              onFieldValueChange(fieldDefinition.id, val)
            }
          />
        </InputField>
      )
    }

    if (isAdministrativeAreaFieldType(field)) {
      const partOfRef = field.config.configuration.partOf?.$declaration

      const partOf =
        partOfRef && makeFormikFieldIdsOpenCRVSCompatible(form)[partOfRef]

      return (
        <InputField {...inputFieldProps}>
          <AdministrativeArea.Input
            {...field.config}
            partOf={typeof partOf === 'string' ? partOf : null}
            value={field.value}
            onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }

    if (isLocationFieldType(field)) {
      return (
        <LocationSearch.Input
          {...field.config}
          searchableResource={['locations']}
          value={field.value}
          onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
        />
      )
    }

    if (isOfficeFieldType(field)) {
      return (
        <LocationSearch.Input
          {...field.config}
          searchableResource={['offices']}
          value={field.value}
          onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
        />
      )
    }

    if (isFacilityFieldType(field)) {
      return (
        <LocationSearch.Input
          {...field.config}
          searchableResource={['facilities']}
          value={field.value}
          onChange={(val) => onFieldValueChange(fieldDefinition.id, val)}
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
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
          formData={form}
        />
      )
    }

    throw new Error(`Unsupported field ${JSON.stringify(fieldDefinition)}`)
  }
)

GeneratedInputField.displayName = 'MemoizedGeneratedInputField'
