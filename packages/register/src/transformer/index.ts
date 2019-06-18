import { IForm, IFormData } from '@register/forms'
import { getConditionalActionsForField } from '@register/forms/utils'

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
    if (!transformedData[section.id]) {
      transformedData[section.id] = {}
    }
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
          `Data is missing for a required field: ${fieldDef.name}` +
            `on section ${section.id}`
        )
      }
      if (
        draftData[section.id][fieldDef.name] &&
        draftData[section.id][fieldDef.name] !== '' &&
        !conditionalActions.includes('hide')
      ) {
        if (fieldDef.mapping && fieldDef.mapping.mutation) {
          fieldDef.mapping.mutation(
            transformedData,
            draftData,
            section.id,
            fieldDef
          )
        } else {
          transformedData[section.id][fieldDef.name] =
            draftData[section.id][fieldDef.name]
        }
      }
    })
    if (draftData[section.id]._fhirID) {
      transformedData[section.id]._fhirID = draftData[section.id]._fhirID
    }
    if (section.mapping && section.mapping.mutation) {
      section.mapping.mutation(transformedData, draftData, section.id)
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
  queryData: any
) => {
  if (!formDefinition.sections) {
    throw new Error('Sections are missing in form definition')
  }
  if (!queryData) {
    throw new Error('Provided query data is not valid')
  }
  const transformedData: IFormData = {}
  formDefinition.sections.forEach(section => {
    transformedData[section.id] = {}
    section.fields.forEach(fieldDef => {
      if (fieldDef.mapping && fieldDef.mapping.query) {
        fieldDef.mapping.query(transformedData, queryData, section.id, fieldDef)
      } else if (
        queryData[section.id] &&
        queryData[section.id][fieldDef.name] &&
        queryData[section.id][fieldDef.name] !== ''
      ) {
        transformedData[section.id][fieldDef.name] =
          queryData[section.id][fieldDef.name]
      }
    })
    if (queryData[section.id] && queryData[section.id].id) {
      transformedData[section.id]._fhirID = queryData[section.id].id
    }
    if (section.mapping && section.mapping.query) {
      section.mapping.query(transformedData, queryData, section.id)
    }
    if (
      transformedData[section.id] &&
      Object.keys(transformedData[section.id]).length < 1
    ) {
      delete transformedData[section.id]
    }
  })
  if (queryData._fhirIDMap) {
    transformedData._fhirIDMap = queryData._fhirIDMap
  }
  return transformedData
}
