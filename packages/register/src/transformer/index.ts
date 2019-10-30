import {
  IForm,
  IFormData,
  TransformedData,
  IFormField,
  IFormFieldMapping,
  IFormFieldMutationMapFunction,
  IFormFieldQueryMapFunction
} from '@register/forms'
import {
  getConditionalActionsForField,
  getVisibleSectionGroupsBasedOnConditions
} from '@register/forms/utils'

const nestedFieldsMapping = (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  fieldDef: IFormField,
  mappingKey: keyof IFormFieldMapping
) => {
  let tempFormField: IFormField
  for (let index in fieldDef.nestedFields) {
    for (let nestedIndex in fieldDef.nestedFields[index]) {
      tempFormField = fieldDef.nestedFields[index][nestedIndex]
      tempFormField &&
        tempFormField.mapping &&
        tempFormField.mapping[mappingKey] &&
        (tempFormField.mapping[mappingKey] as
          | IFormFieldMutationMapFunction
          | IFormFieldQueryMapFunction)(
          transformedData,
          draftData,
          sectionId,
          fieldDef,
          tempFormField
        )
    }
  }
}

export const draftToGqlTransformer = (
  formDefinition: IForm,
  draftData: IFormData,
  draftId?: string
) => {
  if (!formDefinition.sections) {
    throw new Error('Sections are missing in form definition')
  }
  const transformedData: TransformedData = { createdAt: new Date() }
  let inCompleteData = false
  formDefinition.sections.forEach(section => {
    if (!draftData[section.id]) {
      return
    }
    if (!transformedData[section.id]) {
      transformedData[section.id] = {}
    }
    getVisibleSectionGroupsBasedOnConditions(
      section,
      draftData[section.id],
      draftData
    ).forEach(groupDef => {
      groupDef.fields.forEach(fieldDef => {
        const conditionalActions: string[] = getConditionalActionsForField(
          fieldDef,
          draftData[section.id],
          undefined,
          draftData
        )
        if (
          fieldDef.required &&
          !conditionalActions.includes('hide') &&
          (draftData[section.id][fieldDef.name] === undefined ||
            draftData[section.id][fieldDef.name] === '')
        ) {
          console.error(
            `Data is missing for a required field: ${fieldDef.name}` +
              `on section ${section.id}`
          )
          inCompleteData = true
          return
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
            nestedFieldsMapping(
              transformedData,
              draftData,
              section.id,
              fieldDef,
              'mutation'
            )
          } else {
            transformedData[section.id][fieldDef.name] =
              draftData[section.id][fieldDef.name]
          }
        }
      })
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
  if (inCompleteData) {
    if (transformedData.registration) {
      transformedData.registration.inProgress = true
    } else {
      transformedData.registration = { inProgress: true }
    }
  }
  if (draftId) {
    if (transformedData.registration) {
      transformedData.registration.draftId = draftId
    } else {
      transformedData.registration = { draftId }
    }
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

  const visibleSections = formDefinition.sections.filter(
    section =>
      getVisibleSectionGroupsBasedOnConditions(
        section,
        queryData[section.id] || {},
        queryData
      ).length > 0
  )

  visibleSections.forEach(section => {
    transformedData[section.id] = {}
    section.groups.forEach(groupDef => {
      groupDef.fields.forEach(fieldDef => {
        if (fieldDef.mapping && fieldDef.mapping.query) {
          fieldDef.mapping.query(
            transformedData,
            queryData,
            section.id,
            fieldDef
          )
          nestedFieldsMapping(
            transformedData,
            queryData,
            section.id,
            fieldDef,
            'query'
          )
        } else if (
          queryData[section.id] &&
          queryData[section.id][fieldDef.name] &&
          queryData[section.id][fieldDef.name] !== ''
        ) {
          transformedData[section.id][fieldDef.name] =
            queryData[section.id][fieldDef.name]
        }
      })
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
