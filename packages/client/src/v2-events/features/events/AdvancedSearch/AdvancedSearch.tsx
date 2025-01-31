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
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import {
  Accordion,
  Content,
  ContentSize,
  FormTabs,
  IFormTabProps
} from '@opencrvs/components'
import { EventConfig } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'

const messagesToDefine = {
  birthTabTitle: {
    id: 'config.application.birthTabTitle',
    defaultMessage: 'Birth',
    description: 'The title for birth tab'
  },
  advancedSearch: {
    id: 'config.advanced.search',
    defaultMessage: 'Advanced Search',
    description: 'This is used for the advanced search'
  },
  advancedSearchInstruction: {
    id: 'config.advanced.search.instruction',
    defaultMessage:
      'Select the options to build an advanced search. A minimum of two search parameters is required.',
    description: 'This is used for the advanced search'
  },
  hide: {
    defaultMessage: 'Hide',
    description: 'Label for hide button when accordion is closed',
    id: 'advancedSearch.accordion.hide'
  },
  show: {
    defaultMessage: 'Show',
    description: 'Label for show button when accordion is closed',
    id: 'advancedSearch.accordion.show'
  },
  placeOfRegistrationlabel: {
    defaultMessage: 'Place of registration',
    description: 'Label for input Place of registration',
    id: 'advancedSearch.form.placeOfRegistration'
  },
  placeOfRegistrationHelperText: {
    defaultMessage: 'Search for a province, district or registration office',
    description: 'Helper text for input Place of registration',
    id: 'advancedSearch.form.placeOfRegistrationHelperText'
  },
  formSelectPlaceholder: {
    defaultMessage: 'Select',
    description: 'Placeholder text for a select',
    id: 'form.field.select.placeholder'
  }
}

const messages = defineMessages(messagesToDefine)
type AdvancedSearchFormConfig = EventConfig['advancedSearch']

function TabSearch({ sections }: { sections: AdvancedSearchFormConfig }) {
  const intl = useIntl()
  const accordionShowingLabel = intl.formatMessage(messages.show)
  const accordionHidingLabel = intl.formatMessage(messages.hide)

  return sections.map((section) => (
    <Accordion
      key={section.id}
      expand={true}
      label={intl.formatMessage(section.title)}
      labelForHideAction={accordionHidingLabel}
      labelForShowAction={accordionShowingLabel}
      name={section.id}
    >
      <FormFieldGenerator
        fields={section.fields}
        formData={{}}
        id={section.id}
        initialValues={
          {
            /* provide initial values here */
          }
        }
        setAllFieldsDirty={false}
        onChange={(values) => {}}
      />
    </Accordion>
  ))
}

function AdvancedSearch() {
  const intl = useIntl()
  const activeSections = [
    {
      id: '',
      title: messages.birthTabTitle,
      fields: [
        {
          id: '',
          label: messages.placeOfRegistrationlabel,
          type: 'FACILITY'
        }
      ]
    }
  ] satisfies AdvancedSearchFormConfig

  const formTabSections = activeSections.map((a) => ({
    id: a.id,
    title: intl.formatMessage(a.title)
  })) satisfies IFormTabProps['sections']

  return (
    <>
      <Content
        size={ContentSize.SMALL}
        subtitle={intl.formatMessage(messages.advancedSearchInstruction)}
        tabBarContent={
          <FormTabs
            activeTabId={intl.formatMessage(messages.birthTabTitle)}
            sections={formTabSections}
            onTabClick={() => {
              alert('tab clicked')
            }}
          />
        }
        title={intl.formatMessage(messages.advancedSearch)}
        titleColor={'copy'}
      >
        <TabSearch sections={activeSections} />
      </Content>
    </>
  )
}

export default AdvancedSearch
