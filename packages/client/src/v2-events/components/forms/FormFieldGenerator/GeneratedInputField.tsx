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

/* eslint-disable max-lines */

import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { omit } from 'lodash'
import styled, { keyframes } from 'styled-components'
import {
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
  isNameFieldType,
  isPhoneFieldType,
  isIdFieldType,
  getValidatorsForField,
  DateRangeFieldValue,
  isSelectDateRangeFieldType,
  SelectDateRangeValue,
  isTimeFieldType,
  isButtonFieldType,
  isPrintButtonFieldType,
  isHttpFieldType,
  isSearchFieldType,
  isLinkButtonFieldType,
  isVerificationStatusType,
  isQueryParamReaderFieldType,
  isIdReaderFieldType,
  isQrReaderFieldType,
  isLoaderFieldType,
  isAgeFieldType,
  isNumberWithUnitFieldType,
  isFieldGroupFieldType,
  FieldType
} from '@opencrvs/commons/client'
import { TextArea } from '@opencrvs/components/lib/TextArea'
import { InputField } from '@client/components/form/InputField'
import {
  BulletList,
  Checkbox,
  AgeField,
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
  Paragraph,
  SelectDateRangeField,
  TimeField,
  Button,
  AlphaPrintButton,
  Http,
  LinkButton,
  VerificationStatus
} from '@client/v2-events/features/events/registered-fields'
import { Address } from '@client/v2-events/features/events/registered-fields/Address'
import { Data } from '@client/v2-events/features/events/registered-fields/Data'
import { File } from '@client/v2-events/components/forms/inputs/FileInput/FileInput'
import { FileWithOption } from '@client/v2-events/components/forms/inputs/FileInput/DocumentUploaderWithOption'
import { DateRangeField } from '@client/v2-events/features/events/registered-fields/DateRangeField'
import { Name } from '@client/v2-events/features/events/registered-fields/Name'
import { Search } from '@client/v2-events/features/events/registered-fields/Search'
import { IdReader } from '@client/v2-events/features/events/registered-fields/IdReader'
import { QrReader } from '@client/v2-events/features/events/registered-fields/QrReader'
import { QueryParamReader } from '@client/v2-events/features/events/registered-fields/QueryParamReader'
import { Loader } from '@client/v2-events/features/events/registered-fields/Loader'
import { NumberWithUnit } from '@client/v2-events/features/events/registered-fields/NumberWithUnit'
import {
  makeFormFieldIdFormikCompatible,
  makeFormikFieldIdOpenCRVSCompatible
} from '../utils'
import { SignatureField } from '../inputs/SignatureField'
import {
  makeFormikFieldIdsOpenCRVSCompatible,
  parseFieldReferencesInConfiguration
} from './utils'
import { useOpencrvsField, useOpencrvsFormContext } from './opencrvsFormHooks'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

export const FormItem = styled.div<{
  ignoreBottomMargin?: boolean
}>`
  animation: ${fadeIn} 500ms;
  margin-bottom: ${({ ignoreBottomMargin }) =>
    ignoreBottomMargin ? '0px' : '22px'};
`

interface GeneratedInputFieldProps<T extends FieldConfig> {
  /**
   * a formik compatible name where '.' means a nested object
   */
  name: string
  fieldDefinition: T
}

export const GeneratedInputField = React.memo(
  <T extends FieldConfig>({
    fieldDefinition,
    name
  }: GeneratedInputFieldProps<T>) => {
    const [
      { value, onBlur, onFieldValueChange, onBatchFieldValueChange },
      { touched, error, disabled },
      _,
      form
    ] = useOpencrvsField<FieldValue>(name, fieldDefinition)
    const { formFields, validatorContext, readonlyMode } =
      useOpencrvsFormContext()
    const intl = useIntl()
    // If label is hidden or default message is empty, we don't need to render label
    const label =
      fieldDefinition.hideLabel || !fieldDefinition.label.defaultMessage
        ? undefined
        : intl.formatMessage(fieldDefinition.label)

    const inputFieldProps = {
      id: name,
      // If label is hidden or default message is empty, we don't need to render label
      label,
      required:
        typeof fieldDefinition.required === 'boolean'
          ? fieldDefinition.required
          : !!fieldDefinition.required,
      disabled: readonlyMode,
      helperText: fieldDefinition.helperText
        ? intl.formatMessage(fieldDefinition.helperText)
        : undefined,
      error,
      touched
    }

    const inputProps = {
      id: name,
      name,
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
      (val: FileFieldValue | null) => onFieldValueChange(name, val),
      [name, onFieldValueChange]
    )

    const handleFileWithOptionChange = useCallback(
      (val: FileFieldWithOptionValue) => onFieldValueChange(name, val),
      [name, onFieldValueChange]
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
    if (isFieldGroupFieldType(field)) {
      return (
        <InputField {...field.inputFieldProps}>
          {field.config.fields.map((subfield) => {
            const subfieldName = `${name}.${makeFormFieldIdFormikCompatible(subfield.id)}`
            return (
              <FormItem
                key={subfield.id}
                ignoreBottomMargin={subfield.type === FieldType.PAGE_HEADER}
              >
                <GeneratedInputField
                  fieldDefinition={subfield}
                  name={subfieldName}
                />
              </FormItem>
            )
          })}
        </InputField>
      )
    }

    if (isNameFieldType(field)) {
      const validation = getValidatorsForField(
        makeFormikFieldIdOpenCRVSCompatible(field.config.id),
        field.config.validation || []
      )

      return (
        // We are showing errors to underlying text input, so we need to ignore them here
        <InputField
          {...(field.config.configuration?.showParentFieldError
            ? field.inputFieldProps
            : omit(field.inputFieldProps, 'error'))}
        >
          <Name.Input
            configuration={field.config.configuration}
            disabled={disabled}
            id={fieldDefinition.id}
            validation={validation}
            validatorContext={validatorContext}
            value={field.value}
            onChange={(val) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }

    if (isPhoneFieldType(field)) {
      return (
        <InputField {...field.inputFieldProps}>
          <Text.Input
            {...inputProps}
            isDisabled={inputProps.disabled}
            type="text"
            value={field.value}
            onChange={(val) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }

    if (isIdFieldType(field)) {
      return (
        <InputField {...field.inputFieldProps}>
          <Text.Input
            {...inputProps}
            isDisabled={inputProps.disabled}
            type="text"
            value={field.value}
            onChange={(val) => onFieldValueChange(name, val)}
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
            onChange={(val: string) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }

    if (isAgeFieldType(field)) {
      return (
        <InputField
          {...inputFieldProps}
          postfix={
            field.config.configuration.postfix &&
            intl.formatMessage(field.config.configuration.postfix)
          }
          prefix={
            field.config.configuration.prefix &&
            intl.formatMessage(field.config.configuration.prefix)
          }
        >
          <AgeField.Input
            {...inputProps}
            asOfDateRef={field.config.configuration.asOfDate.$$field}
            value={field.value?.age}
            onChange={(val) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }

    if (isTimeFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <TimeField.Input
            {...inputProps}
            use12HourFormat={field.config.configuration?.use12HourFormat}
            value={field.value}
            onChange={(val: string) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }

    if (isDateRangeFieldType(field)) {
      const parsed = DateRangeFieldValue.safeParse(field.value)
      return (
        <InputField {...field.inputFieldProps}>
          <DateRangeField.Input
            {...inputProps}
            value={parsed.data}
            onBlur={onBlur}
            onChange={(val) => {
              onFieldValueChange(name, val)
            }}
          />
        </InputField>
      )
    }

    if (isSelectDateRangeFieldType(field)) {
      return (
        <InputField {...field.inputFieldProps}>
          <SelectDateRangeField.Input
            {...inputProps}
            options={field.config.options}
            value={field.value}
            onChange={(val: SelectDateRangeValue) => {
              onFieldValueChange(name, val)
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
          configuration={field.config.configuration}
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
            onChange={(val) => onFieldValueChange(name, val)}
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
            onChange={(val) => onFieldValueChange(name, val)}
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
            onChange={(val) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }
    if (isNumberWithUnitFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <NumberWithUnit.Input
            {...inputProps}
            configuration={field.config.configuration}
            options={field.config.options}
            value={field.value}
            onChange={(val) => onFieldValueChange(name, val)}
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
            onChange={(e) => onFieldValueChange(name, e.target.value)}
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
            disabled={disabled}
            error={inputFieldProps.error}
            label={uploadedFileNameLabel}
            maxFileSize={field.config.configuration.maxFileSize}
            maxImageSize={field.config.configuration.maxImageSize}
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
        // We are showing errors to underlying inputs, so we need to ignore them here
        <InputField {...omit(field.inputFieldProps, 'error')}>
          <Address.Input
            {...field.config}
            configuration={field.config.configuration}
            disabled={disabled}
            validatorContext={validatorContext}
            value={field.value}
            //@TODO: We need to come up with a general solution for complex types.
            // @ts-ignore
            onChange={(val) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }
    if (isSelectFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <Select.Input
            {...field.config}
            disabled={disabled}
            value={field.value}
            onChange={(val: string) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }
    if (isCountryFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <SelectCountry.Input
            {...field.config}
            disabled={disabled}
            value={field.value}
            onChange={(val) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }
    if (isCheckboxFieldType(field)) {
      return (
        <Checkbox.Input
          {...field.config}
          disabled={disabled}
          value={field.value}
          onChange={(val) => onFieldValueChange(name, val)}
        />
      )
    }
    if (isRadioGroupFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <RadioGroup.Input
            {...field.config}
            disabled={disabled}
            value={field.value}
            onChange={(val) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }

    if (isSignatureFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <SignatureField.Input
            {...field.config}
            disabled={disabled}
            maxFileSize={field.config.configuration.maxFileSize}
            modalTitle={intl.formatMessage(field.config.signaturePromptLabel)}
            name={name}
            required={inputFieldProps.required}
            value={field.value}
            onChange={(val) => handleFileChange(val)}
          />
        </InputField>
      )
    }

    if (isAdministrativeAreaFieldType(field)) {
      const partOfRef = field.config.configuration.partOf?.$declaration

      const partOf =
        partOfRef && makeFormikFieldIdsOpenCRVSCompatible(form)[partOfRef]

      return (
        <InputField {...inputFieldProps} htmlFor={name}>
          <AdministrativeArea.Input
            {...field.config}
            disabled={disabled}
            partOf={typeof partOf === 'string' ? partOf : null}
            value={field.value}
            onChange={(val) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }

    if (isLocationFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <LocationSearch.Input
            {...field.config}
            disabled={disabled}
            searchableResource={
              field.config.configuration.searchableResource.length > 0
                ? field.config.configuration.searchableResource
                : ['locations']
            }
            value={field.value}
            onBlur={onBlur}
            onChange={(val) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }

    if (isOfficeFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <LocationSearch.Input
            {...field.config}
            disabled={disabled}
            searchableResource={['offices']}
            value={field.value}
            onBlur={onBlur}
            onChange={(val) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }

    if (isFacilityFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <LocationSearch.Input
            {...field.config}
            disabled={disabled}
            searchableResource={['facilities']}
            value={field.value}
            onBlur={onBlur}
            onChange={(val) => onFieldValueChange(name, val)}
          />
        </InputField>
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
            maxImageSize={field.config.configuration.maxImageSize}
            options={field.config.options}
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            value={field.value ?? []}
            onChange={handleFileWithOptionChange}
          />
        </InputField>
      )
    }

    if (isDataFieldType(field)) {
      return (
        <Data.Input
          {...field.config}
          allKnownFields={formFields}
          formData={form}
          onChange={(val) => onFieldValueChange(name, val)}
        />
      )
    }

    if (isPrintButtonFieldType(field)) {
      return (
        <AlphaPrintButton.Input
          buttonLabel={field.config.configuration.buttonLabel}
          disabled={disabled}
          id={name}
          template={field.config.configuration.template}
          value={field.value}
          onChange={(val) => onFieldValueChange(name, val)}
        />
      )
    }

    if (isButtonFieldType(field)) {
      return (
        // Button can be always 'touched' to show errors.
        // Button doesn't have a similar `onBlur -> FocusEvent -> touched -> errors` flow as other InputFields
        <InputField {...inputFieldProps} touched={true}>
          <Button.Input
            configuration={field.config.configuration}
            disabled={inputProps.disabled}
            id={field.config.id}
            value={field.value}
            onChange={(clicks) => onFieldValueChange(name, clicks)}
          />
        </InputField>
      )
    }

    if (isHttpFieldType(field)) {
      return (
        <Http.Input
          key={name}
          configuration={parseFieldReferencesInConfiguration(
            field.config.configuration,
            form
          )}
          form={form}
          parentValue={form[field.config.configuration.trigger.$$field]}
          onChange={(val) => onFieldValueChange(name, val)}
        />
      )
    }
    if (isSearchFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <Search.Input
            key={name}
            configuration={field.config.configuration}
            form={form}
            value={field.value}
            onChange={(val) => onFieldValueChange(name, val)}
          />
        </InputField>
      )
    }

    if (isLinkButtonFieldType(field)) {
      return (
        <LinkButton.Input
          configuration={field.config.configuration}
          disabled={inputProps.disabled}
          id={field.config.id}
        />
      )
    }

    if (isVerificationStatusType(field)) {
      return (
        <VerificationStatus.Input
          configuration={field.config.configuration}
          id={field.config.id}
          value={field.value}
          onReset={() => {
            if (Array.isArray(fieldDefinition.parent)) {
              onBatchFieldValueChange([
                ...fieldDefinition.parent.map((parentField) => ({
                  name: makeFormFieldIdFormikCompatible(parentField.$$field),
                  value: undefined
                })),
                { name, value: null }
              ])
            } else if (fieldDefinition.parent) {
              onBatchFieldValueChange([
                {
                  name: makeFormFieldIdFormikCompatible(
                    fieldDefinition.parent.$$field
                  ),
                  value: undefined
                },
                { name, value: null }
              ])
            }
          }}
        />
      )
    }

    if (isQueryParamReaderFieldType(field)) {
      return (
        <QueryParamReader.Input
          configuration={field.config.configuration}
          onChange={(val) => onFieldValueChange(name, val)}
        />
      )
    }

    if (isIdReaderFieldType(field)) {
      return (
        <IdReader.Input
          id={field.config.id}
          methods={field.config.methods}
          onChange={(val) => onFieldValueChange(name, val)}
        />
      )
    }

    if (isQrReaderFieldType(field)) {
      return (
        <QrReader.Input
          configuration={field.config.configuration}
          onChange={(val) => onFieldValueChange(name, val)}
        />
      )
    }

    if (isLoaderFieldType(field)) {
      return (
        <Loader.Input
          configuration={field.config.configuration}
          id={field.config.id}
        />
      )
    }

    throw new Error(`Unsupported field ${JSON.stringify(fieldDefinition)}`)
  }
)

GeneratedInputField.displayName = 'MemoizedGeneratedInputField'
