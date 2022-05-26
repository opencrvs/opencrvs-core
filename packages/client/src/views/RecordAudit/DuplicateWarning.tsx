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
import React from 'react'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import {
  GQLEventSearchResultSet,
  GQLEventSearchSet
} from '@opencrvs/gateway/src/graphql/schema'
import styled from 'styled-components'
import { Warning } from '@opencrvs/components/lib/interface'

const StyledWarning = styled(Warning)`
  margin: 24px auto 16px;
  max-width: 1140px;
`

export function DuplicateWarning({
  duplicateIds
}: {
  duplicateIds: string[] | undefined
}) {
  const workqueue = useSelector(
    (store: IStoreState) => store.workqueueState.workqueue.data
  )
  const duplicateDeclarations = React.useMemo(() => {
    return (Object.values(workqueue) as GQLEventSearchResultSet[])
      .map((resultSet) => resultSet.results)
      .filter(
        (searchSets): searchSets is (GQLEventSearchSet | null)[] =>
          !!(searchSets && searchSets.length > 0)
      )
      .flat()
      .filter((searchSet): searchSet is GQLEventSearchSet => !!searchSet)
      .filter((searchSet) =>
        duplicateIds?.some((duplicateId) => duplicateId === searchSet.id)
      )
  }, [workqueue, duplicateIds])

  return (
    <>
      {duplicateDeclarations.map(
        (duplicateDeclaration) =>
          duplicateDeclaration?.registration?.trackingId && (
            <StyledWarning
              key={duplicateDeclaration.id}
              label={duplicateDeclaration.registration.trackingId}
            />
          )
      )}
    </>
  )
}
