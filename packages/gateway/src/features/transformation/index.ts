export type IFieldBuilderFunction = (
  accumulatedObj: any,
  fieldValue: string | number
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
  fieldBuilderForVal: IFieldBuilderFunction | IFieldBuilders
) {
  if (sourceVal instanceof Object) {
    if (isFieldBuilder(fieldBuilderForVal)) {
      await transformObj(sourceVal, targetObj, fieldBuilderForVal)
      return targetObj
    }

    throw new Error(
      `Expected ${fieldBuilderForVal} to be a FieldBuilder object. The current field value is ${sourceVal}.`
    )
  }

  if (isBuilderFunction(fieldBuilderForVal)) {
    await fieldBuilderForVal(targetObj, sourceVal)
    return targetObj
  }

  throw new Error(
    `Expected ${fieldBuilderForVal} to be a FieldBuilderFunction. The current field value is ${sourceVal}.`
  )
}

export default async function transformObj(
  sourceObj: object,
  targetObj: object,
  fieldBuilders: IFieldBuilders
) {
  for (const currentPropName in sourceObj) {
    if (sourceObj.hasOwnProperty(currentPropName)) {
      if (Array.isArray(sourceObj[currentPropName])) {
        for (const arrayVal of sourceObj[currentPropName]) {
          await transformField(
            arrayVal,
            targetObj,
            fieldBuilders[currentPropName]
          )
        }

        break
      }

      await transformField(
        sourceObj[currentPropName],
        targetObj,
        fieldBuilders[currentPropName]
      )
    }
  }

  return targetObj
}
