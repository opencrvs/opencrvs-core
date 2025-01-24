/* eslint-disable no-restricted-imports */
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
import { useNavigate } from 'react-router-dom'
import { defineMessages, useIntl } from 'react-intl'
import { ActionType, EventDocument } from '@opencrvs/commons/client'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { generateGoToHomeTabUrl } from '@client/navigation'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'

interface Props {
  event: EventDocument
  pageId: string
}

const messages = defineMessages({
  title: {
    defaultMessage: 'Correct Record',
    description: 'Label for correct record button in dropdown menu',
    id: 'action.correct'
  }
})

export function CorrectorForm(props: Props) {
  const navigate = useNavigate()
  const { event, pageId } = props
  const intl = useIntl()
  console.log('Fetching config')
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  console.log({ configuration })

  const actionConfiguration = configuration.actions.find(
    (action) => action.type === ActionType.REQUEST_CORRECTION
  )

  if (!actionConfiguration) {
    throw new Error(
      'User got to a request correction flow without no configuration defined for this action'
    )
  }

  const formPages = actionConfiguration.onboardingForm

  if (!formPages) {
    throw new Error('Form configuration not found for type: ' + event.type)
  }

  const currentPageId =
    formPages.find((p) => p.id === pageId)?.id || formPages[0]?.id

  if (!currentPageId) {
    throw new Error('Form does not have any pages')
  }

  // const section = getCorrectorSection(event)

  // const group = React.useMemo(
  //   () => ({
  //     ...section.groups[0],
  //     fields: replaceInitialValues(
  //       section.groups[0].fields,
  //       event.data[section.id] || {},
  //       event.data,
  //       config,
  //       user
  //     )
  //   }),
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   []
  // )

  // const modifyDeclaration = (
  //   sectionData: IFormSectionData,
  //   section: IFormSection,
  //   declaration: IDeclaration
  // ) => {
  //   props.modifyDeclaration({
  //     ...declaration,
  //     data: {
  //       ...declaration.data,
  //       [section.id]: {
  //         ...declaration.data[section.id],
  //         ...sectionData
  //       }
  //     }
  //   })
  // }
  // const continueButtonHandler = () => {
  //   const relationship = (event.data.corrector.relationship as IFormSectionData)
  //     .value as string
  //   if (
  //     relationship === CorrectorRelationship.REGISTRAR ||
  //     relationship === CorrectorRelationship.ANOTHER_AGENT
  //   ) {
  //     const changed = {
  //       ...event,
  //       data: {
  //         ...event.data,
  //         corrector: {
  //           ...event.data.corrector,
  //           hasShowedVerifiedDocument: false
  //         }
  //       }
  //     }
  //     props.modifyDeclaration(changed)
  //     props.writeDeclaration(changed)
  //     navigate(
  //       generateGoToPageGroupUrl({
  //         pageRoute: CERTIFICATE_CORRECTION_REVIEW,
  //         declarationId: event.id,
  //         pageId: ReviewSection.Review,
  //         groupId: 'review-view-group',
  //         event: event.event
  //       })
  //     )
  //   } else {
  //     props.writeDeclaration(event)
  //     navigate(
  //       generateVerifyCorrectorUrl({
  //         declarationId: event.id,
  //         corrector: relationship
  //       })
  //     )
  //   }
  // }

  // const continueButton = (
  //   <Button
  //     key="confirm_form"
  //     fullWidth
  //     disabled={groupHasError(
  //       group,
  //       event.data[section.id],
  //       config,
  //       event.data,
  //       user
  //     )}
  //     id="confirm_form"
  //     size="large"
  //     type="primary"
  //     onClick={continueButtonHandler}
  //   >
  //     {intl.formatMessage(buttonMessages.continueButton)}
  //   </Button>
  // )

  return (
    <>
      <ActionPageLight
        hideBackground
        goBack={() => navigate(-1)}
        goHome={() =>
          navigate(
            generateGoToHomeTabUrl({
              tabId: WORKQUEUE_TABS.readyForReview
            })
          )
        }
        id="corrector_form"
        title={intl.formatMessage(messages.title)}
      >
        <PagesComponent
          eventId={event.id}
          formPages={formPages}
          pageId={currentPageId}
          showReviewButton={false}
          onFormPageChange={(nextPageId: string) =>
            navigate(
              ROUTES.V2.EVENTS.REQUEST_CORRECTION.PAGES.buildPath({
                eventId: event.id,
                pageId: nextPageId
              })
            )
          }
          onSubmit={() =>
            navigate(
              ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({ eventId: event.id })
            )
          }
        />
      </ActionPageLight>
    </>
  )
}
