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
import { useCallback } from 'react'
import { useMatch, useParams } from 'react-router-dom'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import { ROUTES } from '@client/v2-events/routes/routes'
import { useUserFormState } from './useUserFormState'

const { USER } = ROUTES.V2.SETTINGS

/** Returns `true` when the current URL is a user editor page of a new user. */
export function useIsNewUser() {
  return useMatch({ path: USER.NEW.path, end: false }) !== null
}

/**
 * The user editor has one set of routes for a new user and one set for an
 * existing user. The URL of an existing user has the id of the user. The URL
 * of a new user has no id, because the user does not exist yet. The id of the
 * new user is in the user form store.
 *
 * Returns the user and the page in the current URL, and builds the paths to
 * the pages of the same user. Use it only on user editor pages.
 */
export function useUserEditorRoutes() {
  const isNewUser = useIsNewUser()
  const params = useParams()
  // All user editor routes have the same search params.
  const [{ from }] = useTypedSearchParams(USER.EDIT)
  const newUserId = useUserFormState((s) => s.newUserId)

  const userId = isNewUser ? newUserId : USER.EDIT.getTypedParams(params).userId

  const editPath = useCallback(
    (pageId: string) =>
      isNewUser
        ? USER.NEW.EDIT.buildPath({ pageId }, { from })
        : USER.EDIT.buildPath({ userId, pageId }, { from }),
    [isNewUser, userId, from]
  )

  const reviewPath = useCallback(
    () =>
      isNewUser
        ? USER.NEW.REVIEW.buildPath({}, { from })
        : USER.REVIEW.buildPath({ userId }, { from }),
    [isNewUser, userId, from]
  )

  return {
    isNewUser,
    userId,
    pageId: params.pageId,
    from,
    editPath,
    reviewPath
  }
}
