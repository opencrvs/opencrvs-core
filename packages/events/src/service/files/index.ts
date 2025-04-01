/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { env } from '@events/environment'
import {
  EventConfig,
  logger,
  EventDocument,
  FileFieldValue,
  FieldType,
  getActiveDeclarationFields
} from '@opencrvs/commons'
import fetch from 'node-fetch'
import { getEventConfigurationById } from '@events/service/config/config'
import { z } from 'zod'

/** TODO: Check if this is used by non-data fields */
function getFieldDefinitionById(configuration: EventConfig, fieldId: string) {
  const actionFields = getActiveDeclarationFields(configuration)

  const fieldConfig = actionFields.find((field) => field.id === fieldId)
  if (!fieldConfig) {
    throw new Error(
      `Failed to find active field configuration for type ${fieldId}`
    )
  }

  return fieldConfig
}

function getFileNameAndSignature(url: string) {
  const { pathname, search } = new URL(url)
  const filename = pathname.split('/').pop()
  return filename + search
}

async function presignFiles(
  filenames: string[],
  token: string
): Promise<string[]> {
  const res = await fetch(new URL(`/presigned-urls`, env.DOCUMENTS_URL), {
    method: 'POST',
    body: JSON.stringify({ filenames }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })

  if (!res.ok) {
    logger.error('Failed to presign files', {
      filenames,
      status: res.status,
      text: await res.text()
    })

    throw new Error('Failed to presign files')
  }

  const fileUrls = z.array(z.string()).parse(await res.json())

  return fileUrls
}

export async function presignFilesInEvent(
  event: EventDocument,
  token: string
): Promise<EventDocument> {
  const configuration = await getEventConfigurationById({
    token,
    eventType: event.type
  })

  /** Note: this targets only data.  */
  const actionFileFields = event.actions.flatMap((action) =>
    Object.entries(action.data)
      .filter(
        ([fieldId]) =>
          getFieldDefinitionById(configuration, fieldId).type === FieldType.FILE
      )
      .filter((value): value is [string, Exclude<FileFieldValue, null>] => {
        return value[1] !== null
      })
      .map(([fieldId, value]) => {
        return [action.type, fieldId, value] as const
      })
  )

  const urls = (
    await presignFiles(
      actionFileFields.map(([, , file]) => file.filename),
      token
    )
  ).map(getFileNameAndSignature)

  const actions = event.actions.map((action) => {
    return {
      ...action,
      data: Object.fromEntries(
        Object.entries(action.data).map(([fieldId, value]) => {
          const fileIndex = actionFileFields.findIndex(
            ([actionType, fileFieldsFieldId]) =>
              actionType === action.type && fieldId === fileFieldsFieldId
          )

          if (fileIndex === -1) {
            return [fieldId, value]
          }
          return [
            fieldId,
            { ...(value as FileFieldValue), filename: urls[fileIndex] }
          ]
        })
      )
    }
  })

  return {
    ...event,
    actions
  }
}

export async function deleteFile(filename: string, token: string) {
  const res = await fetch(new URL(`/files/${filename}`, env.DOCUMENTS_URL), {
    method: 'DELETE',
    headers: {
      Authorization: token
    }
  })
  return res.ok
}
export async function fileExists(filename: string, token: string) {
  const res = await fetch(new URL(`/files/${filename}`, env.DOCUMENTS_URL), {
    method: 'HEAD',
    headers: {
      Authorization: token
    }
  })

  return res.ok
}
