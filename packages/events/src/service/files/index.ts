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
  ActionType,
  EventConfig,
  logger,
  EventDocument,
  FileFieldValue,
  FieldType,
  findActiveActionFields,
  LatentActions
} from '@opencrvs/commons'
import fetch from 'node-fetch'
import { getEventConfigurations } from '@events/service/config/config'
import { z } from 'zod'

function getFieldDefinitionForActionDataField(
  configuration: EventConfig,
  actionType: ActionType,
  fieldId: string
) {
  let actionFields = findActiveActionFields(configuration, actionType)

  if (
    !actionFields &&
    LatentActions.some((latentAction) => latentAction === actionType)
  ) {
    // @TODO: WHhen application is refactored to use main form, remove this.
    actionFields = findActiveActionFields(configuration, ActionType.DECLARE)
  }
  const fieldConfig = actionFields?.find((field) => field.id === fieldId)
  if (!fieldConfig) {
    logger.error(
      `Failed to find active field configuration for type: ${fieldId}, action: ${actionType}`
    )

    throw new Error('Failed to find active form configuration')
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
  const configurations = await getEventConfigurations(token)
  const configuration = configurations.find(
    (config) => config.id === event.type
  )

  if (!configuration) {
    logger.error(`Failed to find configuration for event: ${event.type}`)

    throw new Error('Failed to find configuration for event')
  }

  const actionFileFields = event.actions.flatMap((action) =>
    Object.entries(action.data)
      .filter(
        ([fieldId]) =>
          getFieldDefinitionForActionDataField(
            configuration,
            action.type,
            fieldId
          ).type === FieldType.FILE
      )
      .filter((value): value is [string, Exclude<FileFieldValue, null>] => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
