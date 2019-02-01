import { IForm, IFormData } from '../forms'
import { getConditionalActionsForField } from '../forms/utils'

export const draftToGqlTransformer = (
  formDefinition: IForm,
  draftData: IFormData
) => {
  if (!formDefinition.sections) {
    throw new Error('Sections are missing in form definition')
  }
  const transformedData: any = { createdAt: new Date() }
  formDefinition.sections.forEach(section => {
    if (!draftData[section.id]) {
      return
    }
    transformedData[section.id] = {}
    section.fields.forEach(fieldDef => {
      const conditionalActions: string[] = getConditionalActionsForField(
        fieldDef,
        draftData[section.id]
      )
      if (
        fieldDef.required &&
        !conditionalActions.includes('hide') &&
        (draftData[section.id][fieldDef.name] === undefined ||
          draftData[section.id][fieldDef.name] === '')
      ) {
        throw new Error(
          `Data is missing for a required field: ${fieldDef.name} on section ${
            section.id
          }`
        )
      }
      if (
        draftData[section.id][fieldDef.name] &&
        draftData[section.id][fieldDef.name] !== '' &&
        !conditionalActions.includes('hide')
      ) {
        if (!fieldDef.mapping) {
          transformedData[section.id][fieldDef.name] =
            draftData[section.id][fieldDef.name]
        } else {
          fieldDef.mapping(transformedData, draftData, section.id, fieldDef)
        }
      }
    })
    if (draftData[section.id]._fhirID) {
      transformedData[section.id]._fhirID = draftData[section.id]._fhirID
    }
    if (section.mapping) {
      section.mapping(transformedData, draftData, section.id)
    }
    if (
      transformedData[section.id] &&
      Object.keys(transformedData[section.id]).length < 1
    ) {
      delete transformedData[section.id]
    }
  })
  if (draftData._fhirIDMap) {
    transformedData._fhirIDMap = draftData._fhirIDMap
  }
  return transformedData
}

export const gqlToDraftTransformer = (
  formDefinition: IForm,
  queryData: IFormData
) => {
  if (!formDefinition.sections) {
    throw new Error('Sections are missing in form definition')
  }
  if (!queryData) {
    throw new Error('Provided query data is not valid')
  }
  const transformedData: any = {}
  Object.keys(queryData).forEach(key => {
    return null
  })
  return transformedData
}
