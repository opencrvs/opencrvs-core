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
import { IFormData, IFormSectionData } from '@client/forms'
import { evalExpressionInFieldDefinition } from '@client/forms/utils'
import { getOfflineData } from '@client/offline/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from '@opencrvs/components'

export const RedirectField = ({
  to,
  form,
  draft,
  label,
  callback
}: {
  to: string
  form: IFormSectionData
  draft: IFormData
  label: string
  callback?: {
    trigger: string
    params: Record<string, string>
  }
}) => {
  const config = useSelector(getOfflineData)
  const user = useSelector(getUserDetails)
  const evalPath = evalExpressionInFieldDefinition(
    '`' + to + '`',
    form,
    config,
    draft,
    user
  )

  useEffect(() => {
    if (callback?.params) {
      // TODO: look for params in the url
    }
  }, [callback])

  return (
    <Link element="a" href={evalPath}>
      {label}
    </Link>
  )
}
