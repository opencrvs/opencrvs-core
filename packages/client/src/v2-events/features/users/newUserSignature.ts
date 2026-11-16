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
import {
  FileFieldValue,
  UUID,
  userAttachmentPath
} from '@opencrvs/commons/client'
import {
  cacheFile,
  getCachedFile,
  removeCached
} from '@client/v2-events/cache'
import { uploadFileToPath } from '@client/v2-events/features/files/useFileUpload'
import { trpcClient } from '@client/v2-events/trpc'

/**
 * Uploads the signature of a new user, and stores its path on the user.
 *
 * The signature of a new user stays in the browser cache under the temporary id of
 * the user (see `isNewUserFilePath`). After the server creates the user, this
 * function uploads the file to the prefix of the user, and updates the user with
 * the new path.
 *
 * @throws if the browser cache does not have the file, or if a request fails.
 */
export async function saveNewUserSignature({
  userId,
  signature
}: {
  userId: UUID
  signature: FileFieldValue
}) {
  const file = await getCachedFile(signature.path)

  if (!file) {
    throw new Error(`The browser cache has no file at ${signature.path}`)
  }

  /*
   * The name of the cached file is `<transactionId>.<extension>`. The upload uses
   * the same transaction id, so a retry replaces the same file.
   */
  const transactionId = file.name.replace(/\.[^.]*$/, '')
  const path = await uploadFileToPath(
    file,
    userAttachmentPath(userId),
    transactionId
  )

  const user = await trpcClient.user.update.mutate({
    id: userId,
    signature: { ...signature, path }
  })

  /*
   * The cache keeps the file under the temporary path until the update succeeds,
   * so a retry can read it again.
   */
  await cacheFile({ url: path, file })
  await removeCached(signature.path)

  return user
}
