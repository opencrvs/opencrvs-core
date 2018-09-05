import { IFormField, Ii18nFormField, Ii18nSelectOption, IFormSection } from './'
import { InjectedIntl } from 'react-intl'

export const internationaliseFieldObject = (
  intl: InjectedIntl,
  field: IFormField
): Ii18nFormField => {
  return {
    ...field,
    label: intl.formatMessage(field.label),
    options: field.options
      ? field.options.map(opt => {
          return {
            ...opt,
            label: intl.formatMessage(opt.label)
          } as Ii18nSelectOption
        })
      : undefined
  } as Ii18nFormField
}

const getFormField = (fields: IFormField[], key: string) => {
  return fields.find((field: IFormField) => field.name === key) as IFormField
}

export const getFormFieldIndex = (fields: IFormField[], key: string) => {
  return fields.indexOf(getFormField(fields, key))
}

export const getSectionLengthAtField = (
  section: IFormSection,
  fieldName: string
) => {
  return getFormFieldIndex(section.fields, fieldName) + 1
}

export const insertFields = (
  fields: IFormField[],
  index: number,
  newFields: IFormField[]
) => {
  let insertedFields: IFormField[] = []
  return (insertedFields = insertedFields.concat(
    fields.slice(0, index),
    newFields,
    fields.slice(index)
  ))
}
