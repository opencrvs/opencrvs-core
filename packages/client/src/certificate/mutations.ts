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
import { gql } from '@apollo/client'
import { client } from '@client/utils/apolloClient'
import { CreateOrUpdateCertificateSvgMutation } from '@client/utils/gateway'

const UPDATE_CERTIFICATE_TEMPLATE = gql`
  mutation createOrUpdateCertificateSVG($certificateSVG: CertificateSVGInput!) {
    createOrUpdateCertificateSVG(certificateSVG: $certificateSVG) {
      id
      svgCode
      svgFilename
      user
      status
      event
      svgDateCreated
      svgDateUpdated
    }
  }
`
async function updateCertificateTemplate(
  id: string,
  svgCode: string,
  svgFilename: string,
  user: string,
  status: string,
  event: string
): Promise<CreateOrUpdateCertificateSvgMutation> {
  const certificateSVG = {
    id: id,
    svgCode: svgCode,
    svgFilename: svgFilename,
    user: user,
    status: status,
    event: event
  }
  const response =
    client &&
    (await client.mutate({
      mutation: UPDATE_CERTIFICATE_TEMPLATE,
      variables: { certificateSVG }
    }))

  return response.data
}

export const certificateTemplateMutations = {
  updateCertificateTemplate
}
