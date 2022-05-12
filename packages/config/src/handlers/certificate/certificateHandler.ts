/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as Hapi from '@hapi/hapi'
import Certificate, {
  ICertificateModel,
  Status,
  Event
} from '@config/models/certificate' //   IDeclarationConfigurationModel
import { logger } from '@config/config/logger'
import * as Joi from 'joi'
import { badRequest } from '@hapi/boom'
import { isValidSVGCode } from '@config/services/certificateService'
interface IActivePayload {
  status: Status
  event: Event
}

export async function getCertificateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { status, event } = request.payload as IActivePayload
  const certificate: ICertificateModel | null = await Certificate.findOne({
    status: status,
    event: event
  })

  return certificate
}

export async function getActiveCertificatesHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const activeCertificates = await Certificate.find({
    status: Status.ACTIVE,
    event: { $in: [Event.BIRTH, Event.DEATH] }
  })

  return activeCertificates
}

export async function createCertificateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const newCertificate = request.payload as ICertificateModel

  const validSvgCode: boolean = await isValidSVGCode(newCertificate.svgCode)

  if (!validSvgCode) {
    throw badRequest(
      `SVG code is not valid by given id: ${newCertificate.user}`
    )
  } else {
    // save new certificate
    let certificateResponse
    try {
      certificateResponse = await Certificate.create(newCertificate)
    } catch (err) {
      logger.error(err)
      // return 400 if there is a validation error when saving to mongo
      return h.response().code(400)
    }

    return h.response(certificateResponse).code(201)
  }
}

export async function updateCertificateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const certificate = request.payload as ICertificateModel
    const existingCertificate: ICertificateModel | null =
      await Certificate.findOne({ _id: certificate.id })
    if (!existingCertificate) {
      throw badRequest(`No certificate found by given id: ${certificate.id}`)
    }
    // Update existing certificate's fields
    existingCertificate.svgCode = certificate.svgCode
    existingCertificate.svgFilename = certificate.svgFilename
    existingCertificate.svgDateUpdated = Date.now()
    existingCertificate.user = certificate.user
    existingCertificate.event = certificate.event
    existingCertificate.status = certificate.status
    await Certificate.update(
      { _id: existingCertificate._id },
      existingCertificate
    )
    return h.response(existingCertificate).code(201)
  } catch (err) {
    logger.error(err)
    // return 400 if there is a validation error when saving to mongo
    return h.response().code(400)
  }
}

export async function deleteCertificateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const certificateId = request.params.certificateId
  if (!certificateId) {
    return h.response('No certificate id in URL params').code(404)
  }
  try {
    await Certificate.findOneAndRemove({ _id: certificateId })
  } catch (err) {
    return h
      .response(`Could not delete certificate: ${certificateId}`)
      .code(400)
  }
  return h.response().code(204)
}

export const requestActiveCertificate = Joi.object({
  status: Joi.string().required(),
  event: Joi.string().required()
})

export const requestNewCertificate = Joi.object({
  svgCode: Joi.string(),
  svgFilename: Joi.string(),
  svgDateUpdated: Joi.number(),
  svgDateCreated: Joi.number(),
  user: Joi.string(),
  event: Joi.string(),
  status: Joi.string()
})

export const updateCertificate = Joi.object({
  id: Joi.string().required(),
  svgCode: Joi.string(),
  svgFilename: Joi.string(),
  svgDateUpdated: Joi.number(),
  svgDateCreated: Joi.number(),
  user: Joi.string(),
  event: Joi.string(),
  status: Joi.string()
})
