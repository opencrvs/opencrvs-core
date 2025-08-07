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
import styled from 'styled-components'
import { useIntl, defineMessages } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Accordion } from '@opencrvs/components'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Button } from '@opencrvs/components/lib/Button'
import {
  EventConfig,
  FieldConfig,
  FieldType,
  FieldValue,
  TranslationConfig,
  EventState,
  NameFieldValue,
  isFieldVisible
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { filterEmptyValues } from '@client/v2-events/utils'
import { ROUTES } from '@client/v2-events/routes'
import {
  getAdvancedSearchFieldErrors,
  resolveAdvancedSearchConfig,
  serializeSearchParams
} from './utils'
const MIN_PARAMS_TO_SEARCH = 2

const SearchButton = styled(Button)`
  margin-top: 32px;
`

const messagesToDefine = {
  search: {
    defaultMessage: 'Search',
    description: 'Label for search button',
    id: 'v2.buttons.search'
  },
  hide: {
    defaultMessage: 'Hide',
    description: 'Label for hide button when accordion is closed',
    id: 'v2.advancedSearch.accordion.hide'
  },
  show: {
    defaultMessage: 'Show',
    description: 'Label for show button when accordion is closed',
    id: 'v2.advancedSearch.accordion.show'
  }
}

const messages = defineMessages(messagesToDefine)

function SearchSectionForm({
  section,
  handleFieldChange,
  fieldValues
}: {
  section: {
    title: TranslationConfig
    isExpanded: boolean
    fields: FieldConfig[]
  }
  handleFieldChange: (fieldId: string, value: FieldValue) => void
  fieldValues?: EventState
}) {
  const intl = useIntl()

  return (
    <Accordion
      key={section.title.id}
      expand={section.isExpanded}
      label={intl.formatMessage(section.title)}
      labelForHideAction={intl.formatMessage(messages.hide)}
      labelForShowAction={intl.formatMessage(messages.show)}
      name={section.title.id}
    >
      <FormFieldGenerator
        fields={section.fields}
        id={section.title.id}
        initialValues={fieldValues}
        onChange={(updatedValues) => {
          Object.entries(updatedValues).forEach(([fieldId, value]) =>
            handleFieldChange(fieldId, value)
          )
        }}
      />
    </Accordion>
  )
}

export function TabSearch({
  currentEvent,
  fieldValues,
  onChange
}: {
  currentEvent: EventConfig
  fieldValues: EventState
  onChange: (updatedForm: EventState) => void
}) {
  const intl = useIntl()
  const navigate = useNavigate()

  const [formValues, setFormValues] = useState<EventState>(fieldValues)

  const prevEventId = useRef(currentEvent.id)

  useEffect(() => {
    if (prevEventId.current !== currentEvent.id) {
      setFormValues(fieldValues)
      prevEventId.current = currentEvent.id
    }
  }, [currentEvent, fieldValues])

  useEffect(() => {
    onChange(formValues)
  }, [formValues, onChange])

  const advancedSearchSections = resolveAdvancedSearchConfig(currentEvent)

  const sections = advancedSearchSections.map((section) => ({
    ...section,
    isExpanded: section.fields.some((field) =>
      fieldValues.hasOwnProperty(field.id)
    )
  }))
  const handleFieldChange = (fieldId: string, value: FieldValue) =>
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value
    }))

  const errors = Object.values(
    getAdvancedSearchFieldErrors(sections, formValues)
  ).flatMap((errObj) => errObj.errors)

  const nonEmptyValues = filterEmptyValues(formValues)

  const handleSearch = () => {
    const fields = sections.flatMap((section) => section.fields)

    const updatedValues = Object.entries(nonEmptyValues).reduce(
      (result, [fieldId, value]) => {
        const field = fields.find((f) => f.id === fieldId)
        if (!field || !isFieldVisible(field, formValues)) {
          return result
        }
        if (field.type === FieldType.NAME && typeof value === 'object') {
          const nameValue = NameFieldValue.safeParse(value)
          if (
            nameValue.success &&
            !nameValue.data.firstname &&
            !nameValue.data.surname &&
            !nameValue.data.middlename
          ) {
            return result
          }
        }

        return { ...result, [fieldId]: value }
      },
      {} as Record<string, unknown>
    )

    const queryString = serializeSearchParams(updatedValues)

    const searchPath = ROUTES.V2.SEARCH_RESULT.buildPath({
      eventType: currentEvent.id
    })

    navigate(`${searchPath}?${queryString}`)
  }

  const countNonEmptyFields = (value: unknown): number => {
    if (!value || value === '') {
      return 0
    }
    if (typeof value === 'object') {
      return Object.values(value).reduce<number>(
        (count, val) => count + countNonEmptyFields(val),
        0
      )
    }
    return 1
  }

  const hasEnoughParams =
    countNonEmptyFields(nonEmptyValues) >= MIN_PARAMS_TO_SEARCH

  return (
    <>
      {sections.map((section) => (
        <SearchSectionForm
          key={section.title.id}
          fieldValues={fieldValues}
          handleFieldChange={handleFieldChange}
          section={section}
        />
      ))}
      <SearchButton
        key="search"
        fullWidth
        disabled={!hasEnoughParams || errors.length > 0}
        id="search"
        size="large"
        type="primary"
        onClick={handleSearch}
      >
        <Icon name="MagnifyingGlass" />
        {intl.formatMessage(messages.search)}
      </SearchButton>
    </>
  )
}
