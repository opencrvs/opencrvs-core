import * as React from 'react'
import { withFormik, FastField, Field, FormikProps, FieldProps } from 'formik'
import { isEqual } from 'lodash'
import {
  InjectedIntlProps,
  injectIntl,
  FormattedHTMLMessage,
  FormattedMessage,
  MessageValue
} from 'react-intl'
import {
  TextInput,
  Select,
  RadioGroup,
  CheckboxGroup,
  DateField,
  TextArea,
  WarningMessage,
  PDFViewer
} from '@opencrvs/components/lib/forms'
import { Paragraph, Link } from '@opencrvs/components/lib/typography'
import {
  internationaliseFieldObject,
  getConditionalActionsForField,
  getFieldOptions,
  getFieldLabel,
  getFieldOptionsByValueMapper,
  getFieldType,
  getQueryData
} from '@register/forms/utils'

import styled, { keyframes } from '@register/styledComponents'

import {
  IFormField,
  Ii18nFormField,
  IFormSectionData,
  IFormFieldValue,
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  RADIO_GROUP,
  CHECKBOX_GROUP,
  DATE,
  TEXTAREA,
  NUMBER,
  SUBSECTION,
  LIST,
  PARAGRAPH,
  IMAGE_UPLOADER_WITH_OPTIONS,
  IFileValue,
  TEL,
  INFORMATIVE_RADIO_GROUP,
  WARNING,
  ISelectFormFieldWithDynamicOptions,
  ISelectFormFieldWithOptions,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  ITextFormField,
  IDynamicFormField,
  LINK,
  PDF_DOCUMENT_VIEWER,
  DYNAMIC_LIST,
  IDynamicListFormField,
  IListFormField,
  IFormData,
  FETCH_BUTTON,
  ILoaderButton,
  IForm,
  IFormSection,
  FIELD_GROUP_TITLE
} from '@register/forms'

import { IValidationResult } from '@register/utils/validate'
import { IOfflineDataState } from '@register/offline/reducer'
import { getValidationErrorsForForm } from '@register/forms/validation'
import { InputField } from '@register/components/form/InputField'
import { SubSectionDivider } from '@register/components/form/SubSectionDivider'

import { FormList } from '@register/components/form/FormList'
import { ImageUploadField } from '@register/components/form/ImageUploadField'
import { FetchButtonField } from '@register/components/form/FetchButton'

import { InformativeRadioGroup } from '@register/views/PrintCertificate/InformativeRadioGroup'
import { gqlToDraftTransformer } from '@register/transformer'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const FormItem = styled.div`
  min-height: 6.7em;
  animation: ${fadeIn} 500ms;
`
const LinkFormField = styled(Link)`
  ${({ theme }) => theme.fonts.subtitleStyle};
`

const FieldGroupTitle = styled.div`
  ${({ theme }) => theme.fonts.h4Style};
  margin: 48px 0 0;
`

type GeneratedInputFieldProps = {
  fieldDefinition: Ii18nFormField
  onSetFieldValue: (name: string, value: IFormFieldValue) => void
  onChange: (e: React.ChangeEvent<any>) => void
  onBlur: (e: React.FocusEvent<any>) => void
  resetDependentSelectValues: (name: string) => void
  value: IFormFieldValue
  touched: boolean

  error: string
}

function GeneratedInputField({
  fieldDefinition,
  onChange,
  onBlur,
  onSetFieldValue,
  resetDependentSelectValues,
  error,
  touched,
  value
}: GeneratedInputFieldProps) {
  const inputFieldProps = {
    id: fieldDefinition.name,
    label: fieldDefinition.label,
    description: fieldDefinition.description,
    required: fieldDefinition.required,
    disabled: fieldDefinition.disabled,
    prefix: fieldDefinition.prefix,
    postfix: fieldDefinition.postfix,
    hideAsterisk: fieldDefinition.hideAsterisk,
    error,
    touched,
    mode: fieldDefinition.mode
  }

  const inputProps = {
    id: fieldDefinition.name,
    onChange,
    onBlur,
    value,
    disabled: fieldDefinition.disabled,
    error: Boolean(error),
    touched: Boolean(touched)
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
          options={fieldDefinition.options}
        />
      </InputField>
    )
  }
  if (fieldDefinition.type === RADIO_GROUP) {
    return (
      <InputField {...inputFieldProps}>
        <RadioGroup
          {...inputProps}
          onChange={(val: string) => {
            resetDependentSelectValues(fieldDefinition.name)
            onSetFieldValue(fieldDefinition.name, val)
          }}
          options={fieldDefinition.options}
          name={fieldDefinition.name}
          value={value as string}
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

  if (fieldDefinition.type === DATE) {
    return (
      <InputField {...inputFieldProps}>
        <DateField
          {...inputProps}
          onChange={(val: string) => onSetFieldValue(fieldDefinition.name, val)}
          value={value as string}
        />
      </InputField>
    )
  }
  if (fieldDefinition.type === TEXTAREA) {
    return (
      <InputField {...inputFieldProps}>
        <TextArea {...inputProps} />
      </InputField>
    )
  }
  if (fieldDefinition.type === TEL) {
    return (
      <InputField {...inputFieldProps}>
        <TextInput
          type="tel"
          {...inputProps}
          value={inputProps.value as string}
        />
      </InputField>
    )
  }
  if (fieldDefinition.type === SUBSECTION) {
    return (
      <SubSectionDivider
        label={fieldDefinition.label}
        required={inputFieldProps.required}
      />
    )
  }
  if (fieldDefinition.type === FIELD_GROUP_TITLE) {
    return <FieldGroupTitle>{fieldDefinition.label}</FieldGroupTitle>
  }
  if (fieldDefinition.type === PARAGRAPH) {
    const label = (fieldDefinition.label as unknown) as FormattedMessage.MessageDescriptor

    return (
      <Paragraph fontSize={fieldDefinition.fontSize}>
        <FormattedHTMLMessage
          {...label}
          values={{
            [fieldDefinition.name]: value as MessageValue
          }}
        />
      </Paragraph>
    )
  }
  if (fieldDefinition.type === LIST) {
    return <FormList {...inputProps} list={fieldDefinition.items} />
  }
  if (fieldDefinition.type === NUMBER) {
    return (
      <InputField {...inputFieldProps}>
        <TextInput
          type="number"
          pattern="[0-9]*"
          step={fieldDefinition.step}
          {...inputProps}
          value={inputProps.value as string}
        />
      </InputField>
    )
  }

  if (fieldDefinition.type === WARNING) {
    return <WarningMessage>{fieldDefinition.label}</WarningMessage>
  }

  if (fieldDefinition.type === LINK) {
    return (
      <LinkFormField
        onClick={() => onSetFieldValue(fieldDefinition.name, true)}
      >
        {fieldDefinition.label}
      </LinkFormField>
    )
  }

  if (fieldDefinition.type === PDF_DOCUMENT_VIEWER) {
    return (
      <PDFViewer
        id={fieldDefinition.name}
        pdfSource={fieldDefinition.initialValue as string}
      />
    )
  }

  if (fieldDefinition.type === IMAGE_UPLOADER_WITH_OPTIONS) {
    return (
      <ImageUploadField
        id={inputProps.id}
        title={fieldDefinition.label}
        optionSection={fieldDefinition.optionSection}
        files={value as IFileValue[]}
        onComplete={(files: IFileValue[]) =>
          onSetFieldValue(fieldDefinition.name, files)
        }
      />
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
      />
    )
  }

  return (
    <InputField {...inputFieldProps}>
      <TextInput
        type="text"
        {...inputProps}
        value={inputProps.value as string}
      />
    </InputField>
  )
}

const mapFieldsToValues = (fields: IFormField[]) =>
  fields.reduce(
    (memo, field) => ({ ...memo, [field.name]: field.initialValue }),
    {}
  )

interface IFormSectionProps {
  fields: IFormField[]
  id: string
  setAllFieldsDirty: boolean
  offlineResources?: IOfflineDataState
  onChange: (values: IFormSectionData) => void
  draftData?: IFormData
}

type Props = IFormSectionProps &
  FormikProps<IFormSectionData> &
  InjectedIntlProps

interface IQueryData {
  [key: string]: any
}

class FormSectionComponent extends React.Component<Props> {
  componentWillReceiveProps(nextProps: Props) {
    const userChangedForm = !isEqual(nextProps.values, this.props.values)
    const sectionChanged = this.props.id !== nextProps.id

    if (userChangedForm) {
      this.props.onChange(nextProps.values)
    }

    if (sectionChanged) {
      this.props.resetForm()
      if (nextProps.setAllFieldsDirty) {
        this.showValidationErrors(nextProps.fields)
      }
    }
  }

  async componentDidMount() {
    if (this.props.setAllFieldsDirty) {
      this.showValidationErrors(this.props.fields)
    }
  }

  showValidationErrors(fields: IFormField[]) {
    const touched = fields.reduce(
      (memo, { name }) => ({ ...memo, [name]: true }),
      {}
    )

    this.props.setTouched(touched)
  }

  handleBlur = (e: React.FocusEvent<any>) => {
    this.props.setFieldTouched(e.target.name)
  }

  resetDependentSelectValues = (fieldName: string) => {
    const fields = this.props.fields
    const fieldToReset = fields.find(
      field =>
        field.type === SELECT_WITH_DYNAMIC_OPTIONS &&
        field.dynamicOptions.dependency === fieldName
    )
    if (fieldToReset) {
      this.props.setFieldValue(fieldToReset.name, '')
    }
  }

  render() {
    const {
      values,
      fields,
      setFieldValue,
      touched,
      offlineResources,
      intl,
      draftData,
      setValues
    } = this.props
    const language = this.props.intl.locale

    const errors = (this.props.errors as any) as {
      [key: string]: IValidationResult[]
    }
    /*
     * HACK
     *
     * No idea why, but when "fields" prop is changed from outside,
     * "values" still reflect the old version for one render.
     *
     * This causes React to throw an error. You can see this happening by doing:
     *
     * if (fields.length > Object.keys(values).length) {
     *   console.log({ fields, values })
     * }
     */
    const fieldsWithValuesDefined = fields.filter(
      field => values[field.name] !== undefined
    )

    return (
      <section>
        {fieldsWithValuesDefined.map(field => {
          let error: string
          const fieldErrors = errors[field.name]
          if (fieldErrors && fieldErrors.length > 0) {
            const [firstError] = fieldErrors
            error = intl.formatMessage(firstError.message, firstError.props)
          }
          const conditionalActions: string[] = getConditionalActionsForField(
            field,
            values,
            offlineResources
          )

          if (conditionalActions.includes('hide')) {
            return null
          }

          const withDynamicallyGeneratedFields =
            field.type === SELECT_WITH_DYNAMIC_OPTIONS
              ? ({
                  ...field,
                  type: SELECT_WITH_OPTIONS,
                  options: getFieldOptions(
                    field as ISelectFormFieldWithDynamicOptions,
                    values,
                    offlineResources
                  )
                } as ISelectFormFieldWithOptions)
              : field.type === FIELD_WITH_DYNAMIC_DEFINITIONS
              ? ({
                  ...field,
                  type: getFieldType(field as IDynamicFormField, values),
                  label: getFieldLabel(field as IDynamicFormField, values)
                } as ITextFormField)
              : field.type === DYNAMIC_LIST
              ? ({
                  ...field,
                  type: LIST,
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
                  onFetch: response => {
                    const section = {
                      id: this.props.id,
                      fields: fieldsWithValuesDefined
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
              : field

          if (
            field.type === PDF_DOCUMENT_VIEWER ||
            field.type === IMAGE_UPLOADER_WITH_OPTIONS ||
            field.type === FETCH_BUTTON ||
            field.type === FIELD_WITH_DYNAMIC_DEFINITIONS ||
            field.type === SELECT_WITH_DYNAMIC_OPTIONS
          ) {
            return (
              <FormItem key={`${field.name}`}>
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
                    />
                  )}
                </Field>
              </FormItem>
            )
          } else {
            return (
              <FormItem key={`${field.name}${language}`}>
                <FastField name={field.name}>
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
                    />
                  )}
                </FastField>
              </FormItem>
            )
          }
        })}
      </section>
    )
  }
}

export const FormFieldGenerator = withFormik<
  IFormSectionProps,
  IFormSectionData
>({
  mapPropsToValues: props => mapFieldsToValues(props.fields),
  handleSubmit: values => {
    console.log(values)
  },
  validate: (values, props: IFormSectionProps) =>
    getValidationErrorsForForm(props.fields, values, props.offlineResources)
})(injectIntl(FormSectionComponent))
