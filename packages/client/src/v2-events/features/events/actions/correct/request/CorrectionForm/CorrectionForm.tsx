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
import * as React from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import styled from 'styled-components'
import { EventDocument } from '@opencrvs/commons'
import { CorrectionSection } from '@client/forms'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { CorrectorForm } from './CorrectorForm'

const SpinnerWrapper = styled.div`
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`

export function CorrectionForm() {
  const { eventId, pageId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.PAGES)
  const events = useEvents()

  const [event] = events.getEvent.useSuspenseQuery(eventId)
  const { modal, goToHome } = useEventFormNavigation()
  console.log({ event })

  console.log({ pageId })

  // if (!event) {
  //   return <Navigate to={HOME} />
  // }

  // const logTime = (timeMs: number) => {
  //   modifyDeclaration({
  //     timeLoggedMS: declaration.timeLoggedMS ?? 0 + timeMs
  //   })
  // }

  // if (declaration.writingDraft) {
  //   return (
  //     <SpinnerWrapper>
  //       <Spinner id="draft_write_loading" />
  //     </SpinnerWrapper>
  //   )
  // }

  if (!pageId) {
    return <div />
  }

  return <FormSection event={event} pageId={pageId} />
}

function FormSection({
  pageId,
  event
}: {
  pageId: string
  event: EventDocument
}) {
  switch (pageId) {
    case CorrectionSection.Corrector:
      return <CorrectorForm event={event} pageId={pageId} />
    // case CorrectionSection.Reason:
    //   return <CorrectionReasonForm {...props} />
    // case CorrectionSection.SupportingDocuments:
    //   return <SupportingDocumentsForm {...props} />
    // case CorrectionSection.Summary:
    //   return <CorrectionSummary {...props} />
    default:
      return <>Unknown view</>
  }
}
