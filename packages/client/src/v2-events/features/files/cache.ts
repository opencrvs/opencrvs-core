import {
  EventConfig,
  FieldConfig,
  findPageFields,
  isFileFieldType,
  isFileFieldWithOptionType,
  EventDocument,
  EventIndex
} from '@opencrvs/commons/client'
import { precacheFile } from './useFileUpload'

export async function cacheFiles({
  eventDocument,
  eventIndex,
  eventConfig
}: {
  eventIndex?: EventIndex
  eventDocument?: EventDocument
  eventConfig: EventConfig
}) {
  const fieldTypeMapping = findPageFields(eventConfig).reduce((acc, field) => {
    acc[field.id] = field
    return acc
  }, {} as Record<string, FieldConfig>)

  const promises: Promise<void>[] = []

  eventDocument &&
    eventDocument.actions.forEach((action) =>
      Object.entries(action.data).forEach(([key, value]) => {
        const field = { config: fieldTypeMapping[key], value }

        if (isFileFieldType(field)) {
          promises.push(precacheFile(field.value.filename))
        }
        if (isFileFieldWithOptionType(field)) {
          field.value.forEach((val) =>
            promises.push(precacheFile(val.filename))
          )
        }
      })
    )

  eventIndex &&
    Object.entries(eventIndex.data).forEach(([key, value]) => {
      const field = { config: fieldTypeMapping[key], value }

      if (isFileFieldType(field)) {
        promises.push(precacheFile(field.value.filename))
      }
      if (isFileFieldWithOptionType(field)) {
        field.value.forEach((val) => promises.push(precacheFile(val.filename)))
      }
    })

  await Promise.all(promises)
}
