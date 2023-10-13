import {
  GraphQLObjectType,
  GraphQLSchema,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType
} from 'graphql'

export function generateQueryForType(
  schema: GraphQLSchema,
  typeName: string
): string {
  const type = schema.getType(typeName)

  if (!type || !isObjectType(type)) {
    throw new Error(
      `Type "${typeName}" not found in schema or is not an object type.`
    )
  }

  function buildFields(type: GraphQLObjectType): string {
    const fields = type.getFields()
    let fieldStr = ''

    for (const fieldName in fields) {
      const field = fields[fieldName]
      let fieldType = field.type

      if (isNonNullType(fieldType)) {
        fieldType = fieldType.ofType
      }
      if (isListType(fieldType)) {
        fieldType = fieldType.ofType
      }

      if (isObjectType(fieldType)) {
        fieldStr += `${fieldName} { ${buildFields(fieldType)} } `
      } else if (isScalarType(fieldType)) {
        fieldStr += `${fieldName} `
      }
    }
    return fieldStr.trim()
  }

  return buildFields(type)
}
