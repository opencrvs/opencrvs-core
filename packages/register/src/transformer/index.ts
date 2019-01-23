import { IForm, IFormData } from '../forms'
import { getConditionalActionsForField } from '../forms/utils'

export const draftToMutationTransformer = (
  formDefinition: IForm,
  draftData: IFormData
) => {
  if (!formDefinition.sections) {
    throw new Error('Sections are missing in form definition')
  }
  const transformedData = {}
  formDefinition.sections.forEach(section => {
    transformedData[section.id] = {}
    section.fields.forEach(fieldDef => {
      const conditionalActions: string[] = getConditionalActionsForField(
        fieldDef,
        {}
      )
      if (
        fieldDef.required &&
        !conditionalActions.includes('hide') &&
        !draftData[section.id][fieldDef.name]
      ) {
        throw new Error(
          `Data is missing for a required field: ${fieldDef.name}`
        )
      }
      if (draftData[section.id][fieldDef.name]) {
        if (!fieldDef.mapping) {
          transformedData[section.id][fieldDef.name] =
            draftData[section.id][fieldDef.name]
        } else {
          fieldDef.mapping(transformedData[section.id], draftData[section.id])
        }
      }
    })
  })
  return transformedData
}
