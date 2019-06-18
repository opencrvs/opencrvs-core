export type IFieldBuilderFunction = (
  accumulatedObj: any,
  fieldValue: string | number | boolean,
  context: any
) => void

export interface IFieldBuilders {
  [key: string]: IFieldBuilderFunction | IFieldBuilders
}

function isFieldBuilder(
  x: IFieldBuilderFunction | IFieldBuilders
): x is IFieldBuilders {
  return typeof x === 'object'
}

function isBuilderFunction(
  x: IFieldBuilderFunction | IFieldBuilders
): x is IFieldBuilderFunction {
  return typeof x === 'function'
}

async function transformField(
  sourceVal: any,
  targetObj: any,
  fieldBuilderForVal: IFieldBuilderFunction | IFieldBuilders,
  context: any
) {
  if (!(sourceVal instanceof Date) && typeof sourceVal === 'object') {
    if (isFieldBuilder(fieldBuilderForVal)) {
      await transformObj(sourceVal, targetObj, fieldBuilderForVal, context)
      return targetObj
    }

    throw new Error(
      `Expected ${JSON.stringify(
        fieldBuilderForVal
      )} to be a FieldBuilder object. The current field value is ${JSON.stringify(
        sourceVal
      )}.`
    )
  }

  if (isBuilderFunction(fieldBuilderForVal)) {
    // tslint:disable-next-line
    await fieldBuilderForVal(targetObj, sourceVal, context)
    return targetObj
  }

  throw new Error(
    `Expected ${JSON.stringify(
      fieldBuilderForVal
    )} to be a FieldBuilderFunction. The current field value is ${JSON.stringify(
      sourceVal
    )}.`
  )
}

export default async function transformObj(
  sourceObj: object,
  targetObj: object,
  fieldBuilders: IFieldBuilders,
  context: any = {}
) {
  // ensure the sourceObj has Object in its prototype chain
  // graphql-js creates objects with Object.create(null)
  // tslint:disable-next-line
  sourceObj = Object.assign({}, sourceObj)
  for (const currentPropName in sourceObj) {
    if (sourceObj.hasOwnProperty(currentPropName)) {
      if (Array.isArray(sourceObj[currentPropName])) {
        for (const [index, arrayVal] of sourceObj[currentPropName].entries()) {
          context._index = { ...context._index, [currentPropName]: index }

          /* context._index = {
            [currentPropName]: index
          } */
          await transformField(
            arrayVal,
            targetObj,
            fieldBuilders[currentPropName],
            context
          )
        }

        continue
      }

      await transformField(
        sourceObj[currentPropName],
        targetObj,
        fieldBuilders[currentPropName],
        context
      )
    }
  }

  return targetObj
}
