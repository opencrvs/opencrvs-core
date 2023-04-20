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

import { gql, useLazyQuery } from '@apollo/client'
import { modifyDeclaration } from '@client/declarations'
import { IFormFieldValue } from '@client/forms'
import { useCurrentDraftDeclaration } from '@client/hooks/useCurrentDraftDeclaration'
import {
  VerifyNationalIdQuery,
  VerifyNationalIdQueryVariables
} from '@client/utils/gateway'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router'

export const VERIFY_NATIONAL_ID = gql`
  query verifyNationalId(
    $nationalId: String!
    $firstName: String!
    $lastName: String!
    $birthDate: String!
  ) {
    verifyNationalId(
      nationalId: $nationalId
      firstName: $firstName
      lastName: $lastName
      birthDate: $birthDate
    ) {
      nationalId
      verified
    }
  }
`

export const useVerifyNationalIdQuery = ({
  value: nidVerificationFieldValue
}: {
  value: IFormFieldValue
}) => {
  const { pageId } = useParams<{ pageId: string }>()
  const declaration = useCurrentDraftDeclaration()
  const dispatch = useDispatch()
  const [query, { loading, data, error }] =
    useLazyQuery<VerifyNationalIdQuery>(VERIFY_NATIONAL_ID)

  const verifyNationalId = (
    verifiedFields: string[],
    variables: VerifyNationalIdQueryVariables
  ) => {
    return query({
      variables,
      onCompleted: ({ verifyNationalId }) => {
        if (!declaration || !verifyNationalId?.nationalId) return

        declaration.data[pageId][`${pageId}OsiaNidVerification`] =
          verifyNationalId?.nationalId
        declaration.data[pageId]['fieldsModifiedByNidUserInfo'] = verifiedFields
        dispatch(modifyDeclaration(declaration))
      }
    })
  }

  return {
    status: error
      ? ('error' as const)
      : loading
      ? ('loading' as const)
      : data?.verifyNationalId?.verified || nidVerificationFieldValue
      ? ('verified' as const)
      : ('unverified' as const),
    verifyNationalId
  }
}
