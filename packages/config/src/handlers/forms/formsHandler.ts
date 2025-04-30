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
import { env } from '@config/environment'
import FormVersions, {
  IFormVersionModel,
  Status
} from '@config/models/formVersions'
import * as Hapi from '@hapi/hapi'
import fetch from 'node-fetch'
import { logger } from '@opencrvs/commons'
import { badData } from '@hapi/boom'
import { registrationForms } from './validation'
import { fromZodError } from 'zod-validation-error'

interface IFormsPayload {
  version: string
  birth: string
  death: string
  marriage: string
}

export default async function getForm(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = request.headers.authorization
  const url = new URL('forms', env.COUNTRY_CONFIG_URL)
  const response = await fetch(url, {
    headers: {
      Authorization: token
    }
  })

  if (response.status !== 200) {
    logger.error(
      `Core failed to fetch form definition from ${url.href}. Check country config logs for more details`
    )

    return h.response().code(500)
  }

  const forms: IFormsPayload = await response.json()

  if (process.env.NODE_ENV === 'development') {
    const result = registrationForms.safeParse(forms)

    if (!result.success) {
      throw badData(
        fromZodError(result.error, {
          prefix: 'Form validation error',
          maxIssuesInMessage: 5
        }).message
      )
    }
  }

  const formVersion: IFormVersionModel | null = await FormVersions.findOne({
    version: forms.version
  })
  if (!formVersion) {
    try {
      await FormVersions.create({
        birthForm: JSON.stringify(forms.birth),
        deathForm: JSON.stringify(forms.death),
        marriageForm: JSON.stringify(forms.marriage),
        version: forms.version,
        status: Status.ACTIVE
      })
    } catch (err) {
      logger.error(err)
      // return 400 if there is a validation error when saving to mongo
      return h.response().code(400)
    }
  }
  return h.response(forms).code(200)
}
