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
import * as React from 'react'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { RadioGroup, RadioSize } from '@opencrvs/components/lib/Radio'
import { Checkbox, CheckboxGroup } from '@opencrvs/components/lib/Checkbox'
import { TextArea } from '@opencrvs/components/lib/TextArea'
import { Select } from '@opencrvs/components/lib/Select'
import { DateField } from '@opencrvs/components/lib/DateField'
import { TimeField } from '@opencrvs/components/lib/TimeField'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { Link } from '@opencrvs/components/lib/Link'
import { Text } from '@opencrvs/components/lib/Text'
import {
  internationaliseFieldObject,
  getConditionalActionsForField,
  getFieldOptions,
  getFieldLabel,
  getFieldLabelToolTip,
  getFieldOptionsByValueMapper,
  getFieldType,
  getQueryData,
  getVisibleOptions,
  getListOfLocations,
  getFieldHelperText
} from '@client/forms/utils'

import styled, { keyframes } from 'styled-components'
import { gqlToDraftTransformer } from '@client/transformer'
import {
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  RADIO_GROUP,
  CHECKBOX_GROUP,
  CHECKBOX,
  DATE,
  DOCUMENT_UPLOADER_WITH_OPTION,
  TEXTAREA,
  TEL,
  WARNING,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  IDynamicFormField,
  IFileValue,
  IForm,
  IFormField,
  IFormFieldValue,
  IFormSectionData,
  Ii18nFormField,
  INFORMATIVE_RADIO_GROUP,
  ISelectFormFieldWithDynamicOptions,
  ISelectFormFieldWithOptions,
  ITextFormField,
  Ii18nTextFormField,
  LINK,
  BULLET_LIST,
  NUMBER,
  BIG_NUMBER,
  PARAGRAPH,
  DYNAMIC_LIST,
  IDynamicListFormField,
  IListFormField,
  IFormData,
  FETCH_BUTTON,
  ILoaderButton,
  FIELD_GROUP_TITLE,
  IFormSection,
  SIMPLE_DOCUMENT_UPLOADER,
  IAttachmentValue,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  Ii18nRadioGroupWithNestedFieldsFormField,
  LOCATION_SEARCH_INPUT,
  Ii18nTextareaFormField,
  TEXT,
  DATE_RANGE_PICKER,
  IDateRangePickerValue,
  TIME,
  NID_VERIFICATION_BUTTON,
  INidVerificationButton,
  DIVIDER,
  HEADING3,
  SUBSECTION_HEADER,
  HIDDEN
} from '@client/forms'
import { getValidationErrorsForForm, Errors } from '@client/forms/validation'
import { InputField } from '@client/components/form/InputField'
import { FetchButtonField } from '@client/components/form/FetchButton'

import { InformativeRadioGroup } from '@client/views/PrintCertificate/InformativeRadioGroup'
import { DocumentUploaderWithOption } from './DocumentUploadfield/DocumentUploaderWithOption'
import {
  WrappedComponentProps as IntlShapeProps,
  MessageDescriptor,
  useIntl
} from 'react-intl'
import {
  FastField,
  Field,
  FormikProps,
  FieldProps,
  FormikTouched,
  FormikValues,
  Formik
} from 'formik'
import { IOfflineData, LocationType } from '@client/offline/reducer'
import { isEqual, flatten } from 'lodash'
import { SimpleDocumentUploader } from './DocumentUploadfield/SimpleDocumentUploader'
import { getOfflineData } from '@client/offline/selectors'
import { dynamicDispatch } from '@client/declarations'
import { useDispatch, useSelector } from 'react-redux'
import { LocationSearch } from '@opencrvs/components/lib/LocationSearch'
import { REGEXP_NUMBER_INPUT_NON_NUMERIC } from '@client/utils/constants'
import { isMobileDevice } from '@client/utils/commonUtils'
import { generateLocations } from '@client/utils/locationUtils'
import { getUserDetails } from '@client/profile/profileSelectors'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { DateRangePickerForFormField } from '@client/components/DateRangePickerForFormField'
import { IBaseAdvancedSearchState } from '@client/search/advancedSearch/utils'
import { UserDetails } from '@client/utils/userUtils'
import { VerificationButton } from '@opencrvs/components/lib/VerificationButton'
import { useOnlineStatus } from '@client/utils'
import { useNidAuthentication } from '@client/views/OIDPVerificationCallback/utils'
import { BulletList, Divider } from '@opencrvs/components'
import { Heading2, Heading3 } from '@opencrvs/components/lib/Headings/Headings'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const FormItem = styled.div<{
  ignoreBottomMargin?: boolean
}>`
  animation: ${fadeIn} 500ms;
  margin-bottom: ${({ ignoreBottomMargin }) =>
    ignoreBottomMargin ? '0px' : '20px'};
`

function handleSelectFocus(id: string, isSearchable: boolean) {
  if (isMobileDevice() && isSearchable) {
    setTimeout(() => {
      const inputElement = document.getElementById(`${id}-form-input`)

      if (inputElement) {
        inputElement.scrollIntoView({
          behavior: 'smooth'
        })
      }
    }, 20)
  }
}

type GeneratedInputFieldProps = {
  fieldDefinition: Ii18nFormField
  onSetFieldValue: (name: string, value: IFormFieldValue) => void
  onChange: (e: React.ChangeEvent<any>) => void
  onBlur: (e: React.FocusEvent<any>) => void
  resetDependentSelectValues: (name: string) => void
  resetNestedInputValues?: (field: Ii18nFormField) => void
  nestedFields?: { [key: string]: JSX.Element[] }
  value: IFormFieldValue
  touched: boolean
  error: string
  draftData?: IFormData
  disabled?: boolean
  onUploadingStateChanged?: (isUploading: boolean) => void
  requiredErrorMessage?: MessageDescriptor
  setFieldTouched?: (name: string, isTouched?: boolean) => void
} & Omit<IDispatchProps, 'writeDeclaration'>

const GeneratedInputField = React.memo<GeneratedInputFieldProps>(
  ({
    fieldDefinition,
    onChange,
    onBlur,
    onSetFieldValue,
    resetDependentSelectValues,
    resetNestedInputValues,
    error,
    touched,
    value,
    nestedFields,
    draftData,
    disabled,
    dynamicDispatch,
    onUploadingStateChanged,
    setFieldTouched,
    requiredErrorMessage
  }) => {
    const inputFieldProps = {
      id: fieldDefinition.name,
      label: fieldDefinition.label,
      helperText: fieldDefinition.helperText,
      tooltip: fieldDefinition.tooltip,
      description: fieldDefinition.description,
      required: fieldDefinition.required,
      disabled: fieldDefinition.disabled,
      prefix: fieldDefinition.prefix,
      postfix: fieldDefinition.postfix,
      unit: fieldDefinition.unit,
      hideAsterisk: fieldDefinition.hideAsterisk,
      hideInputHeader: fieldDefinition.hideHeader,
      error,
      touched,
      mode: fieldDefinition.mode,
      ignoreMediaQuery: fieldDefinition.ignoreMediaQuery
    }

    const intl = useIntl()
    const onChangeGroupInput = React.useCallback(
      (val: string) => onSetFieldValue(fieldDefinition.name, val),
      [fieldDefinition.name, onSetFieldValue]
    )
    const isOnline = useOnlineStatus()

    const inputProps = {
      id: fieldDefinition.name,
      onChange,
      onBlur,
      value,
      disabled: fieldDefinition.disabled ?? disabled,
      error: Boolean(error),
      touched: Boolean(touched),
      placeholder: fieldDefinition.placeholder,
      ignoreMediaQuery: fieldDefinition.ignoreMediaQuery
    }
    if (fieldDefinition.type === SELECT_WITH_OPTIONS) {
      return (
        <InputField {...inputFieldProps}>
          <Select
            {...inputProps}
            isDisabled={fieldDefinition.disabled}
            value={value as string}
            onChange={(val: string) => {
              resetDependentSelectValues(fieldDefinition.name)
              onSetFieldValue(fieldDefinition.name, val)
            }}
            onFocus={() =>
              handleSelectFocus(
                fieldDefinition.name,
                fieldDefinition.options.length > 10
              )
            }
            options={fieldDefinition.options}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === DOCUMENT_UPLOADER_WITH_OPTION) {
      return (
        <DocumentUploaderWithOption
          {...inputProps}
          name={fieldDefinition.name}
          label={fieldDefinition.label}
          options={fieldDefinition.options}
          splitView={fieldDefinition.splitView}
          files={value as IFileValue[]}
          extraValue={fieldDefinition.extraValue || ''}
          hideOnEmptyOption={fieldDefinition.hideOnEmptyOption}
          onComplete={(files: IFileValue[]) => {
            onSetFieldValue(fieldDefinition.name, files)
            setFieldTouched && setFieldTouched(fieldDefinition.name, true)
          }}
          onUploadingStateChanged={onUploadingStateChanged}
          requiredErrorMessage={requiredErrorMessage}
        />
      )
    }
    if (fieldDefinition.type === SIMPLE_DOCUMENT_UPLOADER) {
      return (
        <SimpleDocumentUploader
          {...inputProps}
          name={fieldDefinition.name}
          label={fieldDefinition.label}
          description={fieldDefinition.description}
          allowedDocType={fieldDefinition.allowedDocType}
          files={value as IAttachmentValue}
          error={error}
          onComplete={(file) => {
            setFieldTouched && setFieldTouched(fieldDefinition.name, true)
            onSetFieldValue(fieldDefinition.name, file)
          }}
          onUploadingStateChanged={onUploadingStateChanged}
          requiredErrorMessage={requiredErrorMessage}
        />
      )
    }
    if (fieldDefinition.type === RADIO_GROUP) {
      return (
        <InputField {...inputFieldProps}>
          <RadioGroup
            {...inputProps}
            size={fieldDefinition.size}
            onChange={(val: string) => {
              resetDependentSelectValues(fieldDefinition.name)
              onSetFieldValue(fieldDefinition.name, val)
            }}
            options={fieldDefinition.options}
            name={fieldDefinition.name}
            value={value as string}
            notice={fieldDefinition.notice}
            flexDirection={fieldDefinition.flexDirection}
          />
        </InputField>
      )
    }

    if (
      fieldDefinition.type === RADIO_GROUP_WITH_NESTED_FIELDS &&
      nestedFields &&
      resetNestedInputValues
    ) {
      const visibleRadioOptions = getVisibleOptions(
        fieldDefinition.options,
        draftData as IFormData
      )
      return (
        <InputField {...inputFieldProps}>
          <RadioGroup
            {...inputProps}
            size={RadioSize.LARGE}
            onChange={(val: string) => {
              resetNestedInputValues(fieldDefinition)
              onSetFieldValue(`${fieldDefinition.name}.value`, val)
            }}
            nestedFields={nestedFields}
            options={visibleRadioOptions}
            name={fieldDefinition.name}
            value={value as string}
            notice={fieldDefinition.notice}
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === INFORMATIVE_RADIO_GROUP) {
      return (
        <InformativeRadioGroup
          inputProps={inputProps}
          value={value as string}
          onSetFieldValue={onSetFieldValue}
          fieldDefinition={fieldDefinition}
          inputFieldProps={inputFieldProps}
        />
      )
    }

    if (fieldDefinition.type === CHECKBOX_GROUP) {
      return (
        <InputField {...inputFieldProps}>
          <CheckboxGroup
            {...inputProps}
            options={fieldDefinition.options}
            name={fieldDefinition.name}
            value={value as string[]}
            onChange={(val: string[]) =>
              onSetFieldValue(fieldDefinition.name, val)
            }
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === CHECKBOX) {
      const { checkedValue = true, uncheckedValue = false } = fieldDefinition
      return (
        <InputField {...inputFieldProps}>
          <Checkbox
            {...inputProps}
            label={fieldDefinition.label}
            name={fieldDefinition.name}
            value={String(value)}
            selected={(value as string) === checkedValue}
            onChange={(event: { target: { value: string } }) =>
              onSetFieldValue(
                fieldDefinition.name,
                event.target.value === String(checkedValue)
                  ? uncheckedValue
                  : checkedValue
              )
            }
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === DATE) {
      return (
        <InputField {...inputFieldProps}>
          <DateField
            {...inputProps}
            notice={fieldDefinition.notice}
            ignorePlaceHolder={fieldDefinition.ignorePlaceHolder}
            onChange={(val: string) =>
              onSetFieldValue(fieldDefinition.name, val)
            }
            value={value as string}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === TIME) {
      return (
        <InputField {...inputFieldProps}>
          <TimeField
            {...inputProps}
            ignorePlaceHolder={fieldDefinition.ignorePlaceHolder}
            onChange={onChangeGroupInput}
            value={value as string}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === DATE_RANGE_PICKER) {
      return (
        <InputField {...inputFieldProps}>
          <DateRangePickerForFormField
            inputProps={{ ...inputProps }}
            notice={fieldDefinition.notice}
            ignorePlaceHolder={fieldDefinition.ignorePlaceHolder}
            onChange={(val: IDateRangePickerValue) =>
              onSetFieldValue(fieldDefinition.name, val)
            }
            value={value as IDateRangePickerValue}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === TEXTAREA) {
      return (
        <InputField {...inputFieldProps}>
          <TextArea
            maxLength={(fieldDefinition as Ii18nTextareaFormField).maxLength}
            {...inputProps}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === TEL) {
      return (
        <InputField {...inputFieldProps}>
          <TextInput
            type="tel"
            {...inputProps}
            isSmallSized={fieldDefinition.isSmallSized}
            value={inputProps.value as string}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === DIVIDER) {
      return <Divider />
    }
    if (fieldDefinition.type === HEADING3) {
      return <Heading3>{fieldDefinition.label}</Heading3>
    }
    if (fieldDefinition.type === SUBSECTION_HEADER) {
      return (
        <>
          <Heading2>{fieldDefinition.label}</Heading2>
        </>
      )
    }
    if (fieldDefinition.type === FIELD_GROUP_TITLE) {
      return <Heading3>{fieldDefinition.label}</Heading3>
    }
    if (fieldDefinition.type === PARAGRAPH) {
      const label = fieldDefinition.label as unknown as MessageDescriptor & {
        values: Record<string, string>
      }
      const values = label.values || {}

      const message = intl.formatMessage(label, {
        ...values,
        [fieldDefinition.name]: value as any
      })

      return (
        <Text variant={fieldDefinition.fontVariant ?? 'reg16'} element="p">
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </Text>
      )
    }
    if (fieldDefinition.type === BULLET_LIST) {
      return (
        <BulletList
          font={'reg16'}
          {...inputProps}
          items={fieldDefinition.items}
        />
      )
    }
    if (fieldDefinition.type === NUMBER) {
      return (
        <InputField {...inputFieldProps}>
          <TextInput
            type="number"
            step={fieldDefinition.step}
            max={fieldDefinition.max}
            {...inputProps}
            onKeyPress={(e: { key: string; preventDefault: () => void }) => {
              if (e.key.match(REGEXP_NUMBER_INPUT_NON_NUMERIC)) {
                e.preventDefault()
              }
            }}
            value={inputProps.value as string}
            onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
              event.currentTarget.blur()
            }}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === BIG_NUMBER) {
      return (
        <InputField {...inputFieldProps}>
          <TextInput
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            step={fieldDefinition.step}
            {...inputProps}
            value={inputProps.value as string}
            onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
              event.currentTarget.blur()
            }}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === WARNING) {
      return <ErrorText>{fieldDefinition.label}</ErrorText>
    }

    if (fieldDefinition.type === LINK) {
      return (
        <Link
          type="reg16"
          onClick={() => onSetFieldValue(fieldDefinition.name, true)}
        >
          {fieldDefinition.label}
        </Link>
      )
    }

    if (
      fieldDefinition.type === LOCATION_SEARCH_INPUT &&
      fieldDefinition.locationList
    ) {
      const selectedLocation = fieldDefinition.locationList.find(
        (location) => location.id === value
      )

      return (
        <InputField {...inputFieldProps}>
          <LocationSearch
            buttonLabel={intl.formatMessage(buttonMessages.search)}
            {...inputProps}
            selectedLocation={selectedLocation}
            locationList={fieldDefinition.locationList}
            searchHandler={(item) => {
              onSetFieldValue(fieldDefinition.name, item.id)
              if (fieldDefinition.dispatchOptions) {
                dynamicDispatch(fieldDefinition.dispatchOptions.action, {
                  [fieldDefinition.dispatchOptions.payloadKey]: item.id
                })
              }
            }}
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === FETCH_BUTTON) {
      return (
        <FetchButtonField
          id={fieldDefinition.name}
          queryData={fieldDefinition.queryData}
          modalTitle={fieldDefinition.modalTitle}
          label={fieldDefinition.label}
          successTitle={fieldDefinition.successTitle}
          errorTitle={fieldDefinition.errorTitle}
          onFetch={fieldDefinition.onFetch}
          isDisabled={disabled}
        />
      )
    }

    if (fieldDefinition.type === NID_VERIFICATION_BUTTON) {
      return (
        <InputField {...inputFieldProps}>
          <VerificationButton
            id={fieldDefinition.name}
            onClick={fieldDefinition.onClick}
            labelForVerified={fieldDefinition.labelForVerified}
            labelForUnverified={fieldDefinition.labelForUnverified}
            labelForOffline={fieldDefinition.labelForOffline}
            status={!isOnline ? 'offline' : value ? 'verified' : 'unverified'}
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === HIDDEN) {
      const { error, touched, ignoreMediaQuery, ...allowedInputProps } =
        inputProps

      return (
        <input
          type="hidden"
          {...allowedInputProps}
          value={inputProps.value as string}
        />
      )
    }
    return (
      <InputField {...inputFieldProps}>
        <TextInput
          type="text"
          {...inputProps}
          value={inputProps.value as string}
          maxLength={(fieldDefinition as Ii18nTextFormField).maxLength}
          isDisabled={disabled}
        />
      </InputField>
    )
  },

  // This is a hack to workaround slow renders of Selects.
  // A proper solution would not pass new props to this component everytime,
  // rather they should pass the variable / function references.
  // This may be achieved by useMemo / useCallback'ing the props before passing.

  // If the function returns false, props are not equal and it will re-render
  // If function returns true, they are equal and no rerender happens
  (prevProps, nextProps) =>
    prevProps.fieldDefinition.type === 'SELECT_WITH_OPTIONS' &&
    nextProps.fieldDefinition.type === 'SELECT_WITH_OPTIONS' &&
    prevProps.value === nextProps.value &&
    prevProps.touched === nextProps.touched &&
    prevProps.error === nextProps.error &&
    prevProps.disabled === nextProps.disabled &&
    isEqual(
      prevProps.fieldDefinition.options,
      nextProps.fieldDefinition.options
    )
)

GeneratedInputField.displayName = 'MemoizedGeneratedInputField'

export function getInitialValueForSelectDynamicValue(
  field: IFormField,
  userDetails: UserDetails | null
) {
  let fieldInitialValue = field.initialValue as IFormFieldValue
  const catchmentAreas = userDetails?.catchmentArea
  let district = ''
  let state = ''
  let locationLevel3 = ''

  if (catchmentAreas) {
    catchmentAreas.forEach((catchmentArea) => {
      if (
        catchmentArea?.identifier?.find(
          (identifier) => identifier?.value === 'LOCATION_LEVEL_3'
        )
      ) {
        locationLevel3 = catchmentArea.id
      } else if (
        catchmentArea?.identifier?.find(
          (identifier) => identifier?.value === 'DISTRICT'
        )
      ) {
        district = catchmentArea.id
      } else if (
        catchmentArea?.identifier?.find(
          (identifier) => identifier?.value === 'STATE'
        )
      ) {
        state = catchmentArea.id
      }
    })
  }

  if (field.name.includes('district') && !field.initialValue && district) {
    fieldInitialValue = district as IFormFieldValue
  }
  if (field.name.includes('state') && !field.initialValue && state) {
    fieldInitialValue = state as IFormFieldValue
  }
  if (!field.initialValue && locationLevel3) {
    fieldInitialValue = locationLevel3 as IFormFieldValue
  }
  return fieldInitialValue
}

const mapFieldsToValues = (
  fields: IFormField[],
  userDetails: UserDetails | null
) =>
  fields.reduce((memo, field) => {
    let fieldInitialValue = field.initialValue as IFormFieldValue

    if (field.type === RADIO_GROUP_WITH_NESTED_FIELDS && !field.initialValue) {
      const nestedFieldsFlatted = flatten(Object.values(field.nestedFields))

      const nestedInitialValues = nestedFieldsFlatted.reduce(
        (nestedValues, nestedField) => ({
          ...nestedValues,
          [nestedField.name]: nestedField.initialValue
        }),
        {}
      )

      fieldInitialValue = {
        value: field.initialValue as IFormFieldValue,
        nestedFields: nestedInitialValues
      }
    }

    if (
      field.type === SELECT_WITH_DYNAMIC_OPTIONS &&
      !field.initialValue &&
      field.dynamicOptions.initialValue === 'agentDefault'
    ) {
      fieldInitialValue = getInitialValueForSelectDynamicValue(
        field,
        userDetails
      )
    }
    return { ...memo, [field.name]: fieldInitialValue }
  }, {})

type ISetTouchedFunction = (touched: FormikTouched<FormikValues>) => void
interface IFormSectionProps {
  fields: IFormField[]
  id: string
  fieldsToShowValidationErrors?: IFormField[]
  setAllFieldsDirty: boolean
  onChange: (values: IFormSectionData) => void
  draftData?: IFormData
  onSetTouched?: (func: ISetTouchedFunction) => void
  requiredErrorMessage?: MessageDescriptor
  onUploadingStateChanged?: (isUploading: boolean) => void
  initialValues?: IBaseAdvancedSearchState
}

interface IStateProps {
  offlineCountryConfig: IOfflineData
  userDetails: UserDetails | null
  onNidAuthenticationClick: () => void
}

interface IDispatchProps {
  dynamicDispatch: typeof dynamicDispatch
}

type Props = IFormSectionProps &
  IStateProps &
  IDispatchProps &
  FormikProps<IFormSectionData> &
  IntlShapeProps

interface IQueryData {
  [key: string]: any
}

export interface ITouchedNestedFields {
  value: boolean
  nestedFields: {
    [fieldName: string]: boolean
  }
}

class FormSectionComponent extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    const userChangedForm = !isEqual(this.props.values, prevProps.values)
    const sectionChanged = prevProps.id !== this.props.id

    if (userChangedForm) {
      prevProps.onChange(this.props.values)
    }

    if (sectionChanged) {
      prevProps.resetForm()
      if (this.props.setAllFieldsDirty) {
        this.showValidationErrors(this.props.fields)
      } else if (
        this.props.fieldsToShowValidationErrors &&
        this.props.fieldsToShowValidationErrors.length > 0
      ) {
        this.showValidationErrors(this.props.fieldsToShowValidationErrors)
      }
    }
  }

  async componentDidMount() {
    if (this.props.setAllFieldsDirty) {
      this.showValidationErrors(this.props.fields)
    }

    if (this.props.onSetTouched) {
      this.props.onSetTouched(this.props.setTouched)
    }

    if (window.location.hash) {
      setTimeout(() => {
        const newScroll = document.documentElement.scrollTop - 100
        window.scrollTo(0, newScroll)

        const focusedElementId = window.location.hash.replace('#', '')
        let focusedElement = document.querySelector(
          `input[id*="${focusedElementId}"]`
        ) as HTMLElement
        if (focusedElement === null) {
          // Handling for Select
          focusedElement = document.querySelector(
            `${window.location.hash} input`
          ) as HTMLElement
          focusedElement && focusedElement.focus()
        } else {
          // Handling for Input
          focusedElement && focusedElement.focus()
        }
      }, 0)
    }
  }

  showValidationErrors(fields: IFormField[]) {
    const touched = fields.reduce((memo, field) => {
      let fieldTouched: boolean | ITouchedNestedFields = true
      if (field.nestedFields) {
        fieldTouched = {
          value: true,
          nestedFields: flatten(Object.values(field.nestedFields)).reduce(
            (nestedMemo, nestedField) => ({
              ...nestedMemo,
              [nestedField.name]: true
            }),
            {}
          )
        }
      }
      return { ...memo, [field.name]: fieldTouched }
    }, {})

    this.props.setTouched(touched)
  }

  handleBlur = (e: React.FocusEvent<any>) => {
    this.props.setFieldTouched(e.target.name)
  }

  resetDependentSelectValues = (fieldName: string) => {
    const fields = this.props.fields
    const fieldsToReset = fields.filter(
      (field) =>
        (field.type === SELECT_WITH_DYNAMIC_OPTIONS &&
          field.dynamicOptions.dependency === fieldName) ||
        (field.type === TEXT && field.dependency === fieldName)
    )

    fieldsToReset.forEach((fieldToReset) => {
      this.props.setFieldValue(fieldToReset.name, '')
      this.resetDependentSelectValues(fieldToReset.name)
    })
  }

  resetNestedInputValues = (parentField: Ii18nFormField) => {
    const nestedFields = (
      parentField as Ii18nRadioGroupWithNestedFieldsFormField
    ).nestedFields
    const nestedFieldsToReset = flatten(
      Object.keys(nestedFields).map((key) => nestedFields[key])
    )

    nestedFieldsToReset.forEach((nestedField) => {
      this.props.setFieldValue(
        `${parentField.name}.nestedFields.${nestedField.name}`,
        ''
      )
    })
  }

  render() {
    const {
      values,
      fields,
      setFieldValue,
      setFieldTouched,
      touched,
      offlineCountryConfig,
      intl,
      draftData,
      userDetails,
      setValues,
      dynamicDispatch
    } = this.props

    const language = this.props.intl.locale

    const errors = this.props.errors as unknown as Errors

    const sectionName = this.props.id.split('-')[0]

    return (
      <section>
        {fields.map((field) => {
          let error: string
          const fieldErrors = errors[field.name] && errors[field.name].errors

          if (fieldErrors && fieldErrors.length > 0) {
            const [firstError] = fieldErrors
            error = intl.formatMessage(firstError.message, firstError.props)
          }

          const conditionalActions: string[] = getConditionalActionsForField(
            field,
            { ...draftData?.[sectionName], ...values },
            offlineCountryConfig,
            draftData,
            userDetails
          )

          if (conditionalActions.includes('hide')) {
            return null
          }

          const isFieldDisabled = conditionalActions.includes('disable')
          const isDateField =
            field.type === DATE ||
            (field.type === FIELD_WITH_DYNAMIC_DEFINITIONS &&
              getFieldType(field as IDynamicFormField, values) === DATE)

          if (
            isDateField &&
            touched[`${field.name}-dd`] !== undefined &&
            touched[`${field.name}-mm`] !== undefined &&
            touched[`${field.name}-yyyy`] !== undefined
          ) {
            touched[field.name] =
              touched[`${field.name}-dd`] &&
              touched[`${field.name}-mm`] &&
              touched[`${field.name}-yyyy`]
          }

          const withDynamicallyGeneratedFields =
            field.type === SELECT_WITH_OPTIONS
              ? ({
                  ...field,
                  type: SELECT_WITH_OPTIONS,
                  options: getFieldOptions(
                    field as ISelectFormFieldWithOptions,
                    values,
                    offlineCountryConfig,
                    draftData
                  )
                } as ISelectFormFieldWithOptions)
              : field.type === SELECT_WITH_DYNAMIC_OPTIONS
              ? ({
                  ...field,
                  type: SELECT_WITH_OPTIONS,
                  options: getFieldOptions(
                    field as ISelectFormFieldWithDynamicOptions,
                    values,
                    offlineCountryConfig,
                    draftData
                  )
                } as ISelectFormFieldWithOptions)
              : field.type === FIELD_WITH_DYNAMIC_DEFINITIONS
              ? ({
                  ...field,
                  type: getFieldType(field as IDynamicFormField, values),
                  label: getFieldLabel(field as IDynamicFormField, values),
                  helperText: getFieldHelperText(
                    field as IDynamicFormField,
                    values
                  ),
                  tooltip: getFieldLabelToolTip(
                    field as IDynamicFormField,
                    values
                  )
                } as ITextFormField)
              : field.type === DYNAMIC_LIST
              ? ({
                  ...field,
                  type: BULLET_LIST,
                  items: getFieldOptionsByValueMapper(
                    field as IDynamicListFormField,
                    draftData as IFormData,
                    field.dynamicItems.valueMapper
                  )
                } as IListFormField)
              : field.type === FETCH_BUTTON
              ? ({
                  ...field,
                  queryData: getQueryData(field as ILoaderButton, values),
                  draftData: draftData as IFormData,
                  onFetch: (response) => {
                    const section = {
                      id: this.props.id,
                      groups: [
                        {
                          id: `${this.props.id}-view-group`,
                          fields
                        }
                      ]
                    } as IFormSection

                    const form = {
                      sections: [section]
                    } as IForm

                    const queryData: IQueryData = {}
                    queryData[this.props.id] = response

                    const transformedData = gqlToDraftTransformer(
                      form,
                      queryData
                    )
                    const updatedValues = Object.assign(
                      {},
                      values,
                      transformedData[this.props.id]
                    )
                    setValues(updatedValues)
                  }
                } as ILoaderButton)
              : field.type === LOCATION_SEARCH_INPUT
              ? {
                  ...field,
                  locationList: generateLocations(
                    field.searchableResource.reduce((locations, resource) => {
                      return {
                        ...locations,
                        ...getListOfLocations(offlineCountryConfig, resource)
                      }
                    }, {}),
                    intl,
                    undefined,
                    field.searchableType as LocationType[]
                  )
                }
              : field.type === NID_VERIFICATION_BUTTON
              ? ({
                  ...field,
                  onClick: this.props.onNidAuthenticationClick
                } as INidVerificationButton)
              : field

          if (
            field.type === FETCH_BUTTON ||
            field.type === FIELD_WITH_DYNAMIC_DEFINITIONS ||
            field.type === SELECT_WITH_DYNAMIC_OPTIONS ||
            field.type === NID_VERIFICATION_BUTTON
          ) {
            return (
              <FormItem
                key={`${field.name}`}
                ignoreBottomMargin={field.ignoreBottomMargin}
              >
                <Field name={field.name}>
                  {(formikFieldProps: FieldProps<any>) => (
                    <GeneratedInputField
                      fieldDefinition={internationaliseFieldObject(
                        intl,
                        withDynamicallyGeneratedFields
                      )}
                      onSetFieldValue={setFieldValue}
                      resetDependentSelectValues={
                        this.resetDependentSelectValues
                      }
                      {...formikFieldProps.field}
                      touched={touched[field.name] || false}
                      error={error}
                      draftData={draftData}
                      disabled={isFieldDisabled}
                      dynamicDispatch={dynamicDispatch}
                    />
                  )}
                </Field>
              </FormItem>
            )
          } else if (
            field.type === RADIO_GROUP_WITH_NESTED_FIELDS &&
            field.nestedFields
          ) {
            let nestedFieldElements = Object.create(null)

            nestedFieldElements = Object.keys(field.nestedFields).reduce(
              (childElements, key) => ({
                ...childElements,
                [key]: field.nestedFields[key].map((nestedField) => {
                  let nestedError: string
                  const nestedFieldErrors =
                    errors[field.name] &&
                    errors[field.name].nestedFields[nestedField.name]

                  if (nestedFieldErrors && nestedFieldErrors.length > 0) {
                    const [firstError] = nestedFieldErrors
                    nestedError = intl.formatMessage(
                      firstError.message,
                      firstError.props
                    )
                  }

                  const nestedFieldName = `${field.name}.nestedFields.${nestedField.name}`
                  const nestedFieldTouched =
                    touched[field.name] &&
                    (touched[field.name] as unknown as ITouchedNestedFields)
                      .nestedFields &&
                    (touched[field.name] as unknown as ITouchedNestedFields)
                      .nestedFields[nestedField.name]

                  return (
                    <FormItem
                      key={nestedFieldName}
                      ignoreBottomMargin={field.ignoreBottomMargin}
                    >
                      <FastField name={nestedFieldName}>
                        {(formikFieldProps: FieldProps<any>) => (
                          <GeneratedInputField
                            fieldDefinition={internationaliseFieldObject(intl, {
                              ...nestedField,
                              name: nestedFieldName
                            })}
                            onSetFieldValue={setFieldValue}
                            setFieldTouched={setFieldTouched}
                            resetDependentSelectValues={
                              this.resetDependentSelectValues
                            }
                            {...formikFieldProps.field}
                            touched={nestedFieldTouched || false}
                            error={nestedError}
                            draftData={draftData}
                            dynamicDispatch={dynamicDispatch}
                            onUploadingStateChanged={
                              this.props.onUploadingStateChanged
                            }
                          />
                        )}
                      </FastField>
                    </FormItem>
                  )
                })
              }),
              {}
            )

            return (
              <FormItem
                key={field.name}
                ignoreBottomMargin={field.ignoreBottomMargin}
              >
                <Field name={`${field.name}.value`}>
                  {(formikFieldProps: FieldProps<any>) => (
                    <GeneratedInputField
                      fieldDefinition={internationaliseFieldObject(
                        intl,
                        withDynamicallyGeneratedFields
                      )}
                      onSetFieldValue={setFieldValue}
                      resetDependentSelectValues={
                        this.resetDependentSelectValues
                      }
                      resetNestedInputValues={this.resetNestedInputValues}
                      {...formikFieldProps.field}
                      nestedFields={nestedFieldElements}
                      touched={Boolean(touched[field.name]) || false}
                      error={error}
                      draftData={draftData}
                      dynamicDispatch={dynamicDispatch}
                    />
                  )}
                </Field>
              </FormItem>
            )
          } else {
            return (
              <FormItem
                key={`${field.name}${language}`}
                ignoreBottomMargin={field.ignoreBottomMargin}
              >
                <Field name={field.name}>
                  {(formikFieldProps: FieldProps<any>) => {
                    return (
                      <GeneratedInputField
                        fieldDefinition={internationaliseFieldObject(
                          intl,
                          withDynamicallyGeneratedFields
                        )}
                        onSetFieldValue={setFieldValue}
                        resetDependentSelectValues={
                          this.resetDependentSelectValues
                        }
                        {...formikFieldProps.field}
                        touched={touched[field.name] || false}
                        error={isFieldDisabled ? '' : error}
                        draftData={draftData}
                        dynamicDispatch={dynamicDispatch}
                        disabled={isFieldDisabled}
                        onUploadingStateChanged={
                          this.props.onUploadingStateChanged
                        }
                      />
                    )
                  }}
                </Field>
              </FormItem>
            )
          }
        })}
      </section>
    )
  }
}

export const FormFieldGenerator: React.FC<IFormSectionProps> = (props) => {
  const offlineCountryConfig = useSelector(getOfflineData)
  const userDetails = useSelector(getUserDetails)
  const intl = useIntl()
  const dispatch = useDispatch()
  const { onClick: onNidAuthenticationClick } = useNidAuthentication()

  return (
    <Formik<IFormSectionData>
      initialValues={
        props.initialValues ?? mapFieldsToValues(props.fields, userDetails)
      }
      onSubmit={() => {}}
      validate={(values) =>
        getValidationErrorsForForm(
          props.fields,
          values,
          offlineCountryConfig,
          props.draftData,
          props.requiredErrorMessage
        )
      }
    >
      {(formikProps) => (
        <FormSectionComponent
          {...props}
          {...formikProps}
          intl={intl}
          offlineCountryConfig={offlineCountryConfig}
          userDetails={userDetails}
          dynamicDispatch={(...args) => dispatch(dynamicDispatch(...args))}
          onNidAuthenticationClick={onNidAuthenticationClick}
        />
      )}
    </Formik>
  )
}
