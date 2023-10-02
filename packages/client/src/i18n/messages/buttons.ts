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
import { defineMessages, MessageDescriptor } from 'react-intl'

interface IButtonsMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  archive: MessageDescriptor
  back: MessageDescriptor
  apply: MessageDescriptor
  assign: MessageDescriptor
  cancel: MessageDescriptor
  change: MessageDescriptor
  confirm: MessageDescriptor
  configure: MessageDescriptor
  continueButton: MessageDescriptor
  createUser: MessageDescriptor
  create: MessageDescriptor
  deactivate: MessageDescriptor
  delete: MessageDescriptor
  edit: MessageDescriptor
  editRegistration: MessageDescriptor
  exitButton: MessageDescriptor
  finish: MessageDescriptor
  forgotPassword: MessageDescriptor
  forgottenPIN: MessageDescriptor
  goToHomepage: MessageDescriptor
  login: MessageDescriptor
  logout: MessageDescriptor
  next: MessageDescriptor
  no: MessageDescriptor
  preview: MessageDescriptor
  print: MessageDescriptor
  issue: MessageDescriptor
  register: MessageDescriptor
  reject: MessageDescriptor
  rejectDeclaration: MessageDescriptor
  replace: MessageDescriptor
  retry: MessageDescriptor
  review: MessageDescriptor
  save: MessageDescriptor
  saving: MessageDescriptor
  refresh: MessageDescriptor
  saveExitButton: MessageDescriptor
  deleteDeclaration: MessageDescriptor
  closeDeclaration: MessageDescriptor
  reactivate: MessageDescriptor
  search: MessageDescriptor
  select: MessageDescriptor
  send: MessageDescriptor
  sendForReview: MessageDescriptor
  sendIncomplete: MessageDescriptor
  sendForApproval: MessageDescriptor
  settings: MessageDescriptor
  start: MessageDescriptor
  status: MessageDescriptor
  unassign: MessageDescriptor
  update: MessageDescriptor
  upload: MessageDescriptor
  verify: MessageDescriptor
  yes: MessageDescriptor
  approve: MessageDescriptor
  editRecord: MessageDescriptor
  makeCorrection: MessageDescriptor
  publish: MessageDescriptor
  add: MessageDescriptor
  copy: MessageDescriptor
  copied: MessageDescriptor
  exactDateUnknown: MessageDescriptor
  sendForUpdates: MessageDescriptor
}

const messagesToDefine: IButtonsMessages = {
  archive: {
    id: 'buttons.archive',
    defaultMessage: 'Archive',
    description: 'Archive button text'
  },
  approve: {
    id: 'buttons.approve',
    defaultMessage: 'Approve',
    description: 'Approve button text'
  },
  apply: {
    defaultMessage: 'Apply',
    description: 'Apply button label',
    id: 'buttons.apply'
  },
  assign: {
    defaultMessage: 'Assign',
    description: 'Assign button label',
    id: 'buttons.assign'
  },
  back: {
    defaultMessage: 'Back',
    description: 'Back button',
    id: 'buttons.back'
  },
  cancel: {
    defaultMessage: 'Cancel',
    description: 'Cancel button text in the modal',
    id: 'buttons.cancel'
  },
  change: {
    defaultMessage: 'Change',
    description: 'Change action',
    id: 'buttons.change'
  },
  confirm: {
    defaultMessage: 'Confirm',
    description: 'Confirm button text',
    id: 'buttons.confirm'
  },
  configure: {
    defaultMessage: 'Configure',
    description: 'Configure button text',
    id: 'buttons.configure'
  },
  continueButton: {
    defaultMessage: 'Continue',
    description: 'Continue Button Text',
    id: 'buttons.continue'
  },

  create: {
    defaultMessage: 'Create',
    description: 'Label for submit button of client integration creation form',
    id: 'buttons.create'
  },
  createUser: {
    defaultMessage: 'Create user',
    description: 'Label for submit button of user creation form',
    id: 'user.form.buttons.submit'
  },
  deactivate: {
    defaultMessage: 'Deactivate',
    description: 'Label for confirmation modal for user deactivation',
    id: 'team.user.buttons.deactivate'
  },
  delete: {
    defaultMessage: 'Delete',
    description: 'Delete button',
    id: 'buttons.delete'
  },
  edit: {
    defaultMessage: 'Edit',
    description: 'Edit button text',
    id: 'buttons.edit'
  },
  editRegistration: {
    defaultMessage: 'Edit Registration',
    description: 'Edit registration button text',
    id: 'buttons.editRegistration'
  },
  exitButton: {
    defaultMessage: 'EXIT',
    description: 'Label for Exit button on EventTopBar',
    id: 'buttons.exit'
  },
  finish: {
    defaultMessage: 'Finish',
    description: 'The label for finish printing certificate button',
    id: 'buttons.finish'
  },
  forgotPassword: {
    defaultMessage: 'Forgot password',
    description: 'The label for forgot password button',
    id: 'buttons.forgotPassword'
  },
  forgottenPIN: {
    defaultMessage: 'Forgotten PIN',
    description: 'The label for forgotten pin button',
    id: 'buttons.forgottenPIN'
  },
  goToHomepage: {
    defaultMessage: 'Back to home',
    description: 'Label for Go to Homepage button',
    id: 'buttons.goToHomePage'
  },
  login: {
    defaultMessage: 'Login',
    description: 'Login button on session expire modal',
    id: 'buttons.login'
  },
  logout: {
    defaultMessage: 'Logout',
    description: 'logout title',
    id: 'buttons.logout'
  },
  next: {
    defaultMessage: 'Next',
    description: 'The label for next button',
    id: 'buttons.next'
  },
  no: {
    defaultMessage: 'No',
    description: 'No button text',
    id: 'buttons.no'
  },
  preview: {
    defaultMessage: 'Preview',
    description: 'Preview button',
    id: 'buttons.preview'
  },
  print: {
    defaultMessage: 'Print',
    description: 'Print button text',
    id: 'buttons.print'
  },
  issue: {
    id: 'buttons.issue',
    defaultMessage: 'Issue',
    description: 'Button for issuing'
  },
  reinstate: {
    defaultMessage: 'Reinstate',
    description: 'Label for reinstate button',
    id: 'buttons.reinstate'
  },
  register: {
    defaultMessage: 'Register',
    description: 'Label for button on register confirmation modal',
    id: 'buttons.register'
  },
  reject: {
    defaultMessage: 'Reject',
    description: 'A label for reject link',
    id: 'buttons.reject'
  },
  rejectDeclaration: {
    defaultMessage: 'Reject declaration',
    description: 'Reject declaration button text',
    id: 'buttons.rejectDeclaration'
  },
  replace: {
    defaultMessage: 'Change all',
    description: 'Label for replacing the whole section in review form',
    id: 'buttons.replace'
  },
  retry: {
    defaultMessage: 'Retry',
    description: 'The title of retry button for failed declaration',
    id: 'buttons.retry'
  },
  review: {
    defaultMessage: 'Review',
    description: 'Review button text',
    id: 'buttons.review'
  },

  refresh: {
    defaultMessage: 'Refresh',
    description: 'Refresh button',
    id: 'buttons.refresh'
  },
  save: {
    defaultMessage: 'Save',
    description: 'Save Button Text',
    id: 'buttons.save'
  },
  saving: {
    defaultMessage: 'Saving...',
    description: 'Saving Button Text',
    id: 'buttons.saving'
  },
  saveExitButton: {
    defaultMessage: 'Save & exit',
    description: 'Save & exit Button Text',
    id: 'buttons.saveAndExit'
  },
  deleteDeclaration: {
    defaultMessage: 'Delete declaration',
    description: 'Delete declaration button text',
    id: 'buttons.deleteDeclaration'
  },
  closeDeclaration: {
    defaultMessage: 'Close declaration',
    description: 'Close declaration button text',
    id: 'buttons.closeDeclaration'
  },
  reactivate: {
    defaultMessage: 'Reactivate',
    description: 'Label for confirmation modal for user reactivation',
    id: 'team.user.buttons.reactivate'
  },
  search: {
    defaultMessage: 'Search',
    description: 'The title of search input submit button',
    id: 'buttons.search'
  },
  select: {
    defaultMessage: 'Select',
    description: 'The select title',
    id: 'buttons.select'
  },
  send: {
    defaultMessage: 'Send',
    description: 'Submit button on submit modal',
    id: 'buttons.send'
  },
  sendForReview: {
    defaultMessage: 'Send For review',
    description: 'Submit Button Text',
    id: 'buttons.sendForReview'
  },
  sendIncomplete: {
    defaultMessage: 'Send incomplete',
    description: 'Title for Incomplete submit button',
    id: 'buttons.sendIncomplete'
  },
  sendForApproval: {
    defaultMessage: 'Send For approval',
    description: 'Title for complete submit button',
    id: 'buttons.sendForApproval'
  },
  settings: {
    defaultMessage: 'Settings',
    description: 'Menu item settings',
    id: 'buttons.settings'
  },
  start: {
    defaultMessage: 'Start',
    description: 'Label of start button',
    id: 'buttons.start'
  },
  status: {
    defaultMessage: 'Status',
    description: 'Label of status button',
    id: 'buttons.status'
  },
  unassign: {
    defaultMessage: 'Unassign',
    description: 'Unassign button label',
    id: 'buttons.unassign'
  },
  update: {
    defaultMessage: 'Update',
    description: 'The title of update button for draft declaration',
    id: 'buttons.update'
  },
  upload: {
    defaultMessage: 'Upload',
    description: 'Upload buttton',
    id: 'buttons.upload'
  },
  verify: {
    defaultMessage: 'Verify',
    description: 'Label for verify password button',
    id: 'buttons.verify'
  },
  yes: {
    defaultMessage: 'Yes',
    description: 'Yes button text',
    id: 'buttons.yes'
  },
  editRecord: {
    id: 'buttons.editRecord',
    defaultMessage: 'No, make correction',
    description: 'Correct record button text on review certificate'
  },
  makeCorrection: {
    id: 'buttons.makeCorrection',
    defaultMessage: 'Make correction',
    description: 'Make correction button text on correction summary'
  },
  view: {
    id: 'buttons.view',
    defaultMessage: 'View',
    description: 'Label for link button view'
  },
  publish: {
    id: 'buttons.publish',
    defaultMessage: 'Publish',
    description: 'Publish button text on form config'
  },
  add: {
    id: 'buttons.add',
    defaultMessage: 'Add',
    description: 'Add button text on form config'
  },
  copy: {
    id: 'buttons.copy',
    defaultMessage: 'Copy',
    description: 'Copy button text'
  },
  copied: {
    id: 'buttons.copied',
    defaultMessage: 'Copied',
    description: 'Copied button text'
  },
  exactDateUnknown: {
    id: 'buttons.exactDateUnknown',
    defaultMessage: 'Exact date unknown',
    description:
      'Label for DateRangePickerForFormField components daterangepicker toggle button'
  },
  sendForUpdates: {
    id: 'buttons.sendForUpdates',
    defaultMessage: 'Send for updates'
  }
}

export const buttonMessages: IButtonsMessages = defineMessages(messagesToDefine)
