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
import { Actions } from '@client/views/SysAdmin/Config/Forms/Home/ActionsModal'
import { ActionStatus } from '@client/views/SysAdmin/Config/Forms/utils'

interface IFormConfigMessages
  extends Record<string | number | symbol, MessageDescriptor> {
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
  publishedDescription: MessageDescriptor
  publishedWarning: MessageDescriptor
  contentKey: MessageDescriptor
  certificateHandlebars: MessageDescriptor
  hideField: MessageDescriptor
  requiredForRegistration: MessageDescriptor
  statusChangeError: MessageDescriptor
  statusChangeInPreview: MessageDescriptor
  statusChangePublish: MessageDescriptor
  draftLabel: MessageDescriptor
  previewDate: MessageDescriptor
  publishedDate: MessageDescriptor
  saveDraftTitle: MessageDescriptor
  saveDraftCommentLabel: MessageDescriptor
  saveDraftCommentError: MessageDescriptor
  saveDraftDescription: MessageDescriptor
}

type INavigationMessages = Record<
  Exclude<BirthSection, 'preview'> | Exclude<DeathSection, 'preview'>,
  MessageDescriptor
>

const navigationMessagesToDefine: INavigationMessages = {
  child: {
    id: 'config.form.navigation.child',
    defaultMessage: 'Child details',
    description: 'Label for children details in page navigation'
  },
  mother: {
    id: 'config.form.navigation.mother',
    defaultMessage: 'Mothers details',
    description: 'Label for mother details in page navigation'
  },
  father: {
    id: 'config.form.navigation.father',
    defaultMessage: 'Fathers details',
    description: 'Label for father details in page navigation'
  },
  informant: {
    id: 'config.form.navigation.informant',
    defaultMessage: 'Informant details',
    description: 'Label for informant details in page navigation'
  },
  documents: {
    id: 'config.form.navigation.documents',
    defaultMessage: 'Documents upload',
    description: 'Label for documents upload in page navigation'
  },
  deceased: {
    id: 'config.form.navigation.deceased',
    defaultMessage: 'Deceased details',
    description: 'Label for deceased details in page navigation'
  },
  deathEvent: {
    id: 'config.form.navigation.deathEvent',
    defaultMessage: 'Event details',
    description: 'Label for event details in page navigation'
  },
  causeOfDeath: {
    id: 'config.form.navigation.causeOfDeath',
    defaultMessage: 'Cause of death',
    description: 'Label for cause of death in page navigation'
  },
  spouse: {
    id: 'config.form.navigation.spouse',
    defaultMessage: 'Spouse details',
    description: 'Label for spouse details in page navigation'
  },
  registration: {
    id: 'config.form.navigation.registration',
    defaultMessage: 'Registration',
    description: 'Label for registration in page navigation'
  },
  primaryCaregiver: {
    id: 'config.form.navigation.primaryCaregiver',
    defaultMessage: 'Primary Caregiver',
    description: 'Label for primaryCaregiver in page navigation'
  }
}

const messagesToDefine: IFormConfigMessages = {
  pages: {
    id: 'config.form.navigation.pages',
    defaultMessage: 'Pages',
    description: 'Label for Pages in page navigation'
  },
  showHiddenFields: {
    id: 'config.form.tools.showHiddenFields',
    defaultMessage: 'Show hidden fields',
    description: 'Label for Show hidden fields in form tools'
  },
  textInput: {
    id: 'config.form.tools.textInput',
    defaultMessage: 'Text input',
    description: 'Label for Text Input in form tools'
  },
  textAreaInput: {
    id: 'config.form.tools.textAreaInput',
    defaultMessage: 'Text area input',
    description: 'Label for Text area input in form tools'
  },
  numberInput: {
    id: 'config.form.tools.numberInput',
    defaultMessage: 'Number input',
    description: 'Label for Number input in form tools'
  },
  phoneNumberInput: {
    id: 'config.form.tools.phoneNumberInput',
    defaultMessage: 'Phone number input',
    description: 'Label for Phone number input in form tools'
  },
  heading: {
    id: 'config.form.tools.heading',
    defaultMessage: 'Heading',
    description: 'Label for Heading in form tools'
  },
  supportingCopy: {
    id: 'config.form.tools.supportingCopy',
    defaultMessage: 'Supporting copy',
    description: 'Label for Supporting copy in form tools'
  },
  addInputContent: {
    id: 'config.form.tools.addInputContent',
    defaultMessage: 'Add input/content',
    description: 'Label for Add input/content in form tools'
  },
  title: {
    id: 'config.form.title',
    defaultMessage: 'Declaration Forms',
    description: 'Title for Form Configuration Page'
  },
  previewDescription: {
    id: 'config.form.preview.description',
    defaultMessage:
      'These versions are available to review and test. Log in using the test users acounts for a  Field Agent, Registration Agent or Registrar to test your declaration form.',
    description: 'Description for preview tab'
  },
  publishedDescription: {
    id: 'config.form.published.description',
    defaultMessage:
      'Your pulished declaration forms will appear here. Once your configuration is published you will no longer be able to make changes.',
    description: 'Description for published tab'
  },
  publishedWarning: {
    id: 'config.form.published.warning',
    defaultMessage:
      'Nothing is currently published. Awaiting to be published: {events}',
    description: 'Warning for unpublished events'
  },
  contentKey: {
    id: 'config.form.tools.contentKey',
    defaultMessage: 'Content Key',
    description: 'Content key label for formTools'
  },
  certificateHandlebars: {
    id: 'config.form.tools.certificateHandlebars',
    defaultMessage: 'Certificate handlebars',
    description: 'Certificate handlebars label for formTools'
  },
  hideField: {
    id: 'config.form.tools.hideField',
    defaultMessage: 'Hide field',
    description: 'Hide field label for formTools'
  },
  requiredForRegistration: {
    id: 'config.form.tools.requiredForRegistration',
    defaultMessage: 'Required for registration',
    description: 'Required for registration label for formTools'
  },
  statusChangeError: {
    id: 'config.form.statusChange.error',
    defaultMessage: 'Something went wrong. Please try again',
    description: 'Error toast description for status change failure'
  },
  statusChangeInPreview: {
    id: 'config.form.statusChange.inPreview',
    defaultMessage: '{event} declaration form v{version} is now in preview',
    description: 'Success toast description for status change to inPreview'
  },
  statusChangePublish: {
    id: 'config.form.statusChange.publish',
    defaultMessage:
      '{event} declaration form v{version} successfully published',
    description: 'Success toast description for status change to inPreview'
  },
  draftLabel: {
    id: 'config.form.draft.label',
    defaultMessage: '{event} v{version}',
    description: 'FormDraft label'
  },
  previewDate: {
    id: 'config.form.preview.created',
    defaultMessage: 'Created {updatedAt, date, ::MMMM yyyy}',
    description: 'In preview draft created at label'
  },
  publishedDate: {
    id: 'config.form.publish.published',
    defaultMessage: 'Published {updatedAt, date, ::MMMM yyyy}',
    description: 'Published draft published at label'
  },
  saveDraftTitle: {
    id: 'config.form.draft.save.title',
    defaultMessage: 'Save draft?',
    description: 'Title for save draft modal'
  },
  saveDraftDescription: {
    id: 'config.form.draft.save.description',
    defaultMessage:
      'A version of this declaration form will be saved as a draft.',
    description: 'Description for save draft modal'
  },
  saveDraftCommentLabel: {
    id: 'config.form.draft.save.comment.label',
    defaultMessage: 'Description of changes',
    description: 'Comment area label for save draft modal'
  },
  saveDraftCommentError: {
    id: 'config.form.draft.save.comment.error',
    defaultMessage: 'You must provide a description of your changes',
    description: 'Comment area error message for save draft modal'
  }
}

const draftStatusMessagesToDefine: Record<
  Exclude<DraftStatus, 'DRAFT' | 'DELETED'>,
  MessageDescriptor
> = {
  PREVIEW: {
    id: 'config.form.status.preview',
    defaultMessage: 'In Preview',
    description: 'Label for in preview tab of form config page'
  },
  PUBLISHED: {
    id: 'config.form.status.published',
    defaultMessage: 'Published',
    description: 'Label for published tab of form config page'
  }
}

const draftTabsMessagesToDefine: Record<
  Exclude<DraftStatus, 'DELETED'>,
  MessageDescriptor
> = {
  DRAFT: {
    id: 'config.form.tab.drafts',
    defaultMessage: 'Drafts',
    description: 'Label for drafts tab of form config page'
  },
  PREVIEW: {
    id: 'config.form.tab.inPreview',
    defaultMessage: 'In Preview',
    description: 'Label for in preview tab of form config page'
  },
  PUBLISHED: {
    id: 'config.form.tab.published',
    defaultMessage: 'Published',
    description: 'Label for published tab of form config page'
  }
}

const actionsModalTitleMessagesToDefine: Record<Actions, MessageDescriptor> = {
  PUBLISH: {
    id: 'config.form.publish.confirmation.title',
    defaultMessage: 'Publish {event} form?',
    description: 'Title for publish confirmation'
  },
  PREVIEW: {
    id: 'config.form.preview.confirmation.title',
    defaultMessage: 'Preview {event} form?',
    description: 'Title for preview confirmation'
  },
  EDIT: {
    id: 'config.form.edit.confirmation.title',
    defaultMessage: 'Edit declaration form',
    description: 'Title for edit confirmation'
  },
  DELETE: {
    id: 'config.form.delete.confirmation.title',
    defaultMessage: 'Delete {event} draft?',
    description: 'Title for delete confirmation'
  }
}

const actionsModalDescriptionMessagesToDefine: Record<
  Actions,
  MessageDescriptor
> = {
  PUBLISH: {
    id: 'config.form.publish.confirmation.description',
    defaultMessage:
      'By publishing this declaration form you confirm that it is ready to be used by registration offices. You will not be able to make any future edits.',
    description: 'Description for publish confirmation'
  },
  PREVIEW: {
    id: 'config.form.preview.confirmation.description',
    defaultMessage:
      'This will make the form availble to test users. So that you can test the form and certificate',
    description: 'Description for preview confirmation'
  },
  EDIT: {
    id: 'config.form.edit.confirmation.description',
    defaultMessage:
      'This will make a new draft version for you to make updates. Your previewed form will revert to the default configuration.',
    description: 'Description for edit confirmation'
  },
  DELETE: {
    id: 'config.form.delete.confirmation.description',
    defaultMessage:
      'This will delete all draft versions and revert back to the default configuration.',
    description: 'Description for delete confirmation'
  }
}

const saveActionMessagesToDefine: Record<
  ActionStatus.ERROR | ActionStatus.COMPLETED | ActionStatus.PROCESSING,
  MessageDescriptor
> = {
  [ActionStatus.ERROR]: {
    id: 'config.form.save.error',
    defaultMessage: 'Something went wrong. Please try again',
    description: 'Save draft error notification label'
  },
  [ActionStatus.PROCESSING]: {
    id: 'config.form.save.inProgress',
    defaultMessage: 'Saving your new draft...',
    description: 'Save draft in progress notification label'
  },
  [ActionStatus.COMPLETED]: {
    id: 'config.form.save.success',
    defaultMessage: 'Draft saved successfully. Redirecting...',
    description: 'Save draft success notification label'
  }
}

export const messages: IFormConfigMessages = defineMessages(messagesToDefine)
export const navigationMessages = defineMessages(navigationMessagesToDefine)
export const draftStatusMessages = defineMessages(draftStatusMessagesToDefine)
export const draftTabsMessages = defineMessages(draftTabsMessagesToDefine)
export const actionsModalTitleMessages = defineMessages(
  actionsModalTitleMessagesToDefine
)
export const actionsModalDescriptionMessages = defineMessages(
  actionsModalDescriptionMessagesToDefine
)
export const saveActionMessages = defineMessages(saveActionMessagesToDefine)
