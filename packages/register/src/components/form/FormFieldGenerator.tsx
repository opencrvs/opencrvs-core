import * as React from 'react'
import { IDynamicValues } from '@opencrvs/components/lib/common-types'
import {
  CheckboxGroup,
  DateField,
  PDFViewer,
  RadioGroup,
  Select,
  TextArea,
  TextInput,
  WarningMessage
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
import { gqlToDraftTransformer } from '@register/transformer'
import {
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  RADIO_GROUP,
  CHECKBOX_GROUP,
  DATE,
  DOCUMENT_UPLOADER_WITH_OPTION,
  TEXTAREA,
  TEL,
  SUBSECTION,
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
  LINK,
  LIST,
  NUMBER,
  PARAGRAPH,
  PDF_DOCUMENT_VIEWER,
  DYNAMIC_LIST,
  IDynamicListFormField,
  IListFormField,
  IFormData,
  FETCH_BUTTON,
  ILoaderButton,
  FIELD_GROUP_TITLE,
  SEARCH_FIELD,
  IFormSection,
  SIMPLE_DOCUMENT_UPLOADER,
  IAttachmentValue
} from '@register/forms'
import { getValidationErrorsForForm } from '@register/forms/validation'
import { InputField } from '@register/components/form/InputField'
import { SubSectionDivider } from '@register/components/form/SubSectionDivider'

import { FormList } from '@register/components/form/FormList'
import { FetchButtonField } from '@register/components/form/FetchButton'

import { InformativeRadioGroup } from '@register/views/PrintCertificate/InformativeRadioGroup'
import { SearchField } from './SearchField'
import { DocumentUploaderWithOption } from './DocumentUploadfield/DocumentUploaderWithOption'
import {
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  FormattedHTMLMessage,
  MessageDescriptor
} from 'react-intl'
import {
  withFormik,
  FastField,
  Field,
  FormikProps,
  FieldProps,
  FormikTouched,
  FormikValues
} from 'formik'
import { IOfflineData } from '@register/offline/reducer'
import { isEqual } from 'lodash'
import { IValidationResult } from '@register/utils/validate'
import { SimpleDocumentUploader } from './DocumentUploadfield/SimpleDocumentUploader'
import { IStoreState } from '@register/store'
import { getOfflineData } from '@register/offline/selectors'
import { connect } from 'react-redux'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const FormItem = styled.div`
  animation: ${fadeIn} 500ms;
  margin-bottom: 40px;
`
const LinkFormField = styled(Link)`
  ${({ theme }) => theme.fonts.bodyStyle};
`

const FieldGroupTitle = styled.div`
  ${({ theme }) => theme.fonts.h4Style};
  margin-top: 16px;
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
    hideInputHeader: fieldDefinition.hideHeader,
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
    touched: Boolean(touched),
    placeholder: fieldDefinition.placeholder
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
  if (fieldDefinition.type === DOCUMENT_UPLOADER_WITH_OPTION) {
    return (
      <DocumentUploaderWithOption
        name={fieldDefinition.name}
        label={fieldDefinition.label}
        options={fieldDefinition.options}
        files={value as IFileValue[]}
        extraValue={fieldDefinition.extraValue || ''}
        onComplete={(files: IFileValue[]) =>
          onSetFieldValue(fieldDefinition.name, files)
        }
      />
    )
  }
  if (fieldDefinition.type === SIMPLE_DOCUMENT_UPLOADER) {
    return (
      <SimpleDocumentUploader
        name={fieldDefinition.name}
        label={fieldDefinition.label}
        description={fieldDefinition.description}
        allowedDocType={fieldDefinition.allowedDocType}
        files={value as IAttachmentValue}
        error={error}
        onComplete={file => onSetFieldValue(fieldDefinition.name, file)}
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
          notice={fieldDefinition.notice}
          ignorePlaceHolder={fieldDefinition.ignorePlaceHolder}
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
    const label = (fieldDefinition.label as unknown) as MessageDescriptor

    return (
      <Paragraph fontSize={fieldDefinition.fontSize}>
        <FormattedHTMLMessage
          {...label}
          values={{
            [fieldDefinition.name]: value as any
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

  if (fieldDefinition.type === SEARCH_FIELD) {
    return (
      <SearchField
        fieldName={fieldDefinition.name}
        fieldLabel={fieldDefinition.label}
        isFieldRequired={fieldDefinition.required as boolean}
        fieldValue={fieldDefinition.initialValue as IDynamicValues}
        onModalComplete={(label: string, value: string) =>
          onSetFieldValue(fieldDefinition.name, { label, value })
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

type ISetTouchedFunction = (touched: FormikTouched<FormikValues>) => void
interface IFormSectionProps {
  fields: IFormField[]
  id: string
  setAllFieldsDirty: boolean
  onChange: (values: IFormSectionData) => void
  draftData?: IFormData
  onSetTouched?: (func: ISetTouchedFunction) => void
}

interface IStateProps {
  resources: IOfflineData
}

type Props = IFormSectionProps &
  IStateProps &
  FormikProps<IFormSectionData> &
  IntlShapeProps

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

    if (this.props.onSetTouched) {
      this.props.onSetTouched(this.props.setTouched)
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
      resources,
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
     *
     * 22.8.2019
     *
     * This might be because of setState not used with the function syntax
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
            resources,
            draftData
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
                    resources
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
                      groups: [
                        {
                          id: `${this.props.id}-view-group`,
                          fields: fieldsWithValuesDefined
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
              : field

          if (
            field.type === PDF_DOCUMENT_VIEWER ||
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

const FormFieldGeneratorWithFormik = withFormik<
  IFormSectionProps & IStateProps,
  IFormSectionData
>({
  mapPropsToValues: props => mapFieldsToValues(props.fields),
  handleSubmit: values => {
    console.log(values)
  },
  validate: (values, props: IFormSectionProps & IStateProps) =>
    getValidationErrorsForForm(
      props.fields,
      values,
      props.resources,
      props.draftData
    )
})(injectIntl(FormSectionComponent))

export const FormFieldGenerator = connect(
  (state: IStoreState, ownProps: IFormSectionProps) => ({
    ...ownProps,
    resources: getOfflineData(state)
  })
)(FormFieldGeneratorWithFormik)
