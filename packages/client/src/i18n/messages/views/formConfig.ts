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
import { defineMessages, MessageDescriptor } from 'react-intl'
import { DeathSection, BirthSection } from '@client/forms'
import { DraftStatus } from '@client/forms/configuration/formDrafts/reducer'

interface IFormConfigMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  introduction: MessageDescriptor
  showHiddenFields: MessageDescriptor
  textInput: MessageDescriptor
  textAreaInput: MessageDescriptor
  numberInput: MessageDescriptor
  phoneNumberInput: MessageDescriptor
  heading: MessageDescriptor
  supportingCopy: MessageDescriptor
  addInputContent: MessageDescriptor
  pages: MessageDescriptor
  title: MessageDescriptor
  previewDescription: MessageDescriptor
  previewConfirmationTitle: MessageDescriptor
  previewConfirmationDescription: MessageDescriptor
  publishedDescription: MessageDescriptor
  publishedConfirmationTitle: MessageDescriptor
  publishedConfirmationDescription: MessageDescriptor
  publishedWarning: MessageDescriptor
  created: MessageDescriptor
  contentKey: MessageDescriptor
  certificateHandlebars: MessageDescriptor
  hideField: MessageDescriptor
  requiredForRegistration: MessageDescriptor
}

type INavigationMessages = Record<
  Exclude<BirthSection, 'preview'> | Exclude<DeathSection, 'preview'>,
  MessageDescriptor
>

const navigationMessagesToDefine: INavigationMessages = {
  child: {
    id: 'form.config.navigation.child',
    defaultMessage: 'Child details',
    description: 'Label for children details in page navigation'
  },
  mother: {
    id: 'form.config.navigation.mother',
    defaultMessage: 'Mothers details',
    description: 'Label for mother details in page navigation'
  },
  father: {
    id: 'form.config.navigation.father',
    defaultMessage: 'Fathers details',
    description: 'Label for father details in page navigation'
  },
  informant: {
    id: 'form.config.navigation.informant',
    defaultMessage: 'Informant details',
    description: 'Label for informant details in page navigation'
  },
  documents: {
    id: 'form.config.navigation.documents',
    defaultMessage: 'Documents upload',
    description: 'Label for documents upload in page navigation'
  },
  deceased: {
    id: 'form.config.navigation.deceased',
    defaultMessage: 'Deceased details',
    description: 'Label for deceased details in page navigation'
  },
  deathEvent: {
    id: 'form.config.navigation.deathEvent',
    defaultMessage: 'Event details',
    description: 'Label for event details in page navigation'
  },
  causeOfDeath: {
    id: 'form.config.navigation.causeOfDeath',
    defaultMessage: 'Cause of death',
    description: 'Label for cause of death in page navigation'
  },
  spouse: {
    id: 'form.config.navigation.spouse',
    defaultMessage: 'Spouse details',
    description: 'Label for spouse details in page navigation'
  },
  registration: {
    id: 'form.config.navigation.registration',
    defaultMessage: 'Registration',
    description: 'Label for registration in page navigation'
  },
  primaryCaregiver: {
    id: 'form.config.navigation.primaryCaregiver',
    defaultMessage: 'Primary Caregiver',
    description: 'Label for primaryCaregiver in page navigation'
  }
}

const messagesToDefine: IFormConfigMessages = {
  introduction: {
    id: 'form.config.navigation.information',
    defaultMessage: 'Introduction',
    description: 'Label for Introduction in page navigation'
  },
  pages: {
    id: 'form.config.navigation.pages',
    defaultMessage: 'Pages',
    description: 'Label for Pages in page navigation'
  },
  showHiddenFields: {
    id: 'form.config.tools.showHiddenFields',
    defaultMessage: 'Show hidden fields',
    description: 'Label for Show hidden fields in form tools'
  },
  textInput: {
    id: 'form.config.tools.textInput',
    defaultMessage: 'Text input',
    description: 'Label for Text Input in form tools'
  },
  textAreaInput: {
    id: 'form.config.tools.textAreaInput',
    defaultMessage: 'Text area input',
    description: 'Label for Text area input in form tools'
  },
  numberInput: {
    id: 'form.config.tools.numberInput',
    defaultMessage: 'Number input',
    description: 'Label for Number input in form tools'
  },
  phoneNumberInput: {
    id: 'form.config.tools.phoneNumberInput',
    defaultMessage: 'Phone number input',
    description: 'Label for Phone number input in form tools'
  },
  heading: {
    id: 'form.config.tools.heading',
    defaultMessage: 'Heading',
    description: 'Label for Heading in form tools'
  },
  supportingCopy: {
    id: 'form.config.tools.supportingCopy',
    defaultMessage: 'Supporting copy',
    description: 'Label for Supporting copy in form tools'
  },
  addInputContent: {
    id: 'form.config.tools.addInputContent',
    defaultMessage: 'Add input/content',
    description: 'Label for Add input/content in form tools'
  },
  title: {
    id: 'config.formConfig.title',
    defaultMessage: 'Declaration Forms',
    description: 'Title for Form Configuration Page'
  },
  previewDescription: {
    id: 'config.formConfig.preview.description',
    defaultMessage:
      'These versions are available to review and test. Log in using the test users acounts for a  Field Agent, Registration Agent or Registrar to test your declaration form.',
    description: 'Description for preview tab'
  },
  previewConfirmationTitle: {
    id: 'config.formConfig.preview.confirmation.title',
    defaultMessage: 'Preview {event} form?',
    description: 'Title for preview confirmation'
  },
  previewConfirmationDescription: {
    id: 'config.formConfig.preview.confirmation.description',
    defaultMessage:
      'This will make the form availble to test users. So that you can test the form and certificate',
    description: 'Description for preview confirmation'
  },
  publishedDescription: {
    id: 'config.formConfig.published.description',
    defaultMessage:
      'Your pulished declaration forms will appear here. Once your configuration is published you will no longer be able to make changes.',
    description: 'Description for published tab'
  },
  publishedConfirmationTitle: {
    id: 'config.formConfig.published.confirmation.title',
    defaultMessage: 'Delete {event} draft?',
    description: 'Title for published confirmation'
  },
  publishedConfirmationDescription: {
    id: 'config.formConfig.published.confirmation.description',
    defaultMessage:
      'This will delete all draft versions and revert back to the default configuration.',
    description: 'Description for published confirmation'
  },
  publishedWarning: {
    id: 'config.formConfig.published.warning',
    defaultMessage:
      'Nothing is currently published. Awaiting to be published: {events}',
    description: 'Description for published tab'
  },
  created: {
    id: 'config.formConfig.preview.created',
    defaultMessage: 'Created',
    description: 'Label for created in preview tab'
  },
  contentKey: {
    id: 'config.formConfig.formTools.contentKey',
    defaultMessage: 'Content Key',
    description: 'Content key label for formTools'
  },
  certificateHandlebars: {
    id: 'config.formConfig.formTools.certificateHandlebars',
    defaultMessage: 'Certificate handlebars',
    description: 'Certificate handlebars label for formTools'
  },
  hideField: {
    id: 'config.formConfig.formTools.hideField',
    defaultMessage: 'Hide field',
    description: 'Hide field label for formTools'
  },
  requiredForRegistration: {
    id: 'config.formConfig.formTools.requiredForRegistration',
    defaultMessage: 'Required for registration',
    description: 'Required for registration label for formTools'
  }
}

const draftStatusMessagesToDefine: Record<
  Exclude<DraftStatus, 'DRAFT' | 'DELETED'>,
  MessageDescriptor
> = {
  PREVIEW: {
    id: 'config.formConfig.preview',
    defaultMessage: 'In Preview',
    description: 'Label for in preview tab of form config page'
  },
  PUBLISHED: {
    id: 'config.formConfig.published',
    defaultMessage: 'Published',
    description: 'Label for published tab of form config page'
  }
}

const draftTabsMessagesToDefine: Record<
  Exclude<DraftStatus, 'DELETED'>,
  MessageDescriptor
> = {
  DRAFT: {
    id: 'config.formConfig.draftsTab',
    defaultMessage: 'Drafts',
    description: 'Label for drafts tab of form config page'
  },
  PREVIEW: {
    id: 'config.formConfig.inPreviewTab',
    defaultMessage: 'In Preview',
    description: 'Label for in preview tab of form config page'
  },
  PUBLISHED: {
    id: 'config.formConfig.publishedTab',
    defaultMessage: 'Published',
    description: 'Label for published tab of form config page'
  }
}

export const messages: IFormConfigMessages = defineMessages(messagesToDefine)
export const navigationMessages = defineMessages(navigationMessagesToDefine)
export const draftStatusMessages = defineMessages(draftStatusMessagesToDefine)
export const draftTabsMessages = defineMessages(draftTabsMessagesToDefine)
