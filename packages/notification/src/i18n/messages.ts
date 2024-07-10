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
export const messageKeys = {
  birthInProgressNotification: 'birthInProgressNotification',
  birthDeclarationNotification: 'birthDeclarationNotification',
  birthRegistrationNotification: 'birthRegistrationNotification',
  birthRejectionNotification: 'birthRejectionNotification',
  deathInProgressNotification: 'deathInProgressNotification',
  deathDeclarationNotification: 'deathDeclarationNotification',
  deathRegistrationNotification: 'deathRegistrationNotification',
  deathRejectionNotification: 'deathRejectionNotification',
  authenticationCodeNotification: 'authenticationCodeNotification',
  userCredentialsNotification: 'userCredentialsNotification',
  retieveUserNameNotification: 'retieveUserNameNotification',
  updateUserNameNotification: 'updateUserNameNotification',
  resetUserPasswordNotification: 'resetUserPasswordNotification'
}

export const templateNames = {
  ONBOARDING_INVITE: {
    sms: 'userCredentialsNotification',
    email: 'onboarding-invite'
  },
  TWO_FACTOR_AUTHENTICATION: {
    sms: 'authenticationCodeNotification',
    email: '2-factor-authentication'
  },
  CHANGE_PHONE_NUMBER: {
    sms: 'authenticationCodeNotification',
    email: 'change-phone-number'
  },
  CHANGE_EMAIL_ADDRESS: {
    sms: 'authenticationCodeNotification',
    email: 'change-email-address'
  },
  PASSWORD_RESET_BY_SYSTEM_ADMIN: {
    sms: 'resetUserPasswordNotification',
    email: 'password-reset-by-system-admin'
  },
  PASSWORD_RESET: {
    sms: 'authenticationCodeNotification',
    email: 'password-reset'
  },
  USERNAME_REMINDER: {
    sms: 'retieveUserNameNotification',
    email: 'username-reminder'
  },
  USERNAME_UPDATED: {
    sms: 'updateUserNameNotification',
    email: 'username-updated'
  },
  CORRECTION_APPROVED: {
    sms: 'correctionApproved',
    email: 'correction-approved'
  },
  CORRECTION_REJECTED: {
    sms: 'correctionRejected',
    email: 'correction-rejected'
  }
}
