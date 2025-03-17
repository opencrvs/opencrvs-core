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

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { useIntl } from 'react-intl'
import { ActionType, FormPage } from '@opencrvs/commons/client'
import { Print } from '@opencrvs/components/lib/icons'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { ROUTES } from '@client/v2-events/routes'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { FormLayout } from '@client/v2-events/layouts'
import { Select } from '@client/v2-events/features/events/registered-fields/Select'
import { InputField } from '@client/components/form/InputField'
import { useCertificateTemplateSelectorFieldConfig } from '@client/v2-events/features/events/useCertificateTemplateSelectorFieldConfig'

export function Pages() {
  const { eventId, pageId } = useTypedParams(
    ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES
  )
  const [searchParams] = useTypedSearchParams(
    ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES
  )
  const [templateId, setTemplateId] = useState<string>()
  const intl = useIntl()
  const navigate = useNavigate()
  const events = useEvents()
  const { modal } = useEventFormNavigation()

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const certTemplateFieldConfig =
    useCertificateTemplateSelectorFieldConfig(event)

  const { setFormValues, getFormValues } = useEventFormData()
  const form = getFormValues()

  // TODO CIHAN: use this from react context
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const formPages = configuration.actions
    .find((action) => action.type === ActionType.PRINT_CERTIFICATE)
    ?.forms.find((f) => f.active)?.pages

  if (!formPages) {
    throw new Error('Form configuration not found for type: ' + event.type)
  }

  const currentPageId =
    formPages.find((p) => p.id === pageId)?.id || formPages[0]?.id

  if (!currentPageId) {
    throw new Error('Form does not have any pages')
  }

  useEffect(() => {
    if (pageId !== currentPageId) {
      navigate(
        ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
          eventId,
          pageId: currentPageId
        }),
        { replace: true }
      )
    }
  }, [pageId, currentPageId, navigate, eventId])

  return (
    <FormLayout
      appbarIcon={<Print />}
      route={ROUTES.V2.EVENTS.PRINT_CERTIFICATE}
    >
      {modal}
      <PagesComponent
        form={form}
        formPages={formPages}
        pageId={currentPageId}
        setFormData={(data) => setFormValues(data)}
        showReviewButton={searchParams.from === 'review'}
        onFormPageChange={(nextPageId: string) =>
          navigate(
            ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
              eventId,
              pageId: nextPageId
            })
          )
        }
        onSubmit={() => {
          if (templateId) {
            navigate(
              ROUTES.V2.EVENTS.PRINT_CERTIFICATE.REVIEW.buildPath(
                { eventId },
                { templateId }
              )
            )
          }
        }}
      >
        {(page: FormPage) => (
          // hard coded certificate template selector form field
          <>
            {formPages[0].id === page.id && (
              <InputField
                id={certTemplateFieldConfig.id}
                label={intl.formatMessage(certTemplateFieldConfig.label)}
                required={true}
                touched={false}
              >
                <Select.Input
                  id={certTemplateFieldConfig.id}
                  label={certTemplateFieldConfig.label}
                  options={certTemplateFieldConfig.options}
                  type="SELECT"
                  value={templateId}
                  onChange={(val: string) => setTemplateId(val)}
                />
              </InputField>
            )}
            <FormFieldGenerator
              fields={page.fields}
              formData={form}
              id="locationForm"
              initialValues={form}
              setAllFieldsDirty={false}
              onChange={(values) => setFormValues(values)}
            />
          </>
        )}
      </PagesComponent>
    </FormLayout>
  )
}
