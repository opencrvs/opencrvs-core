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
export const ENGLISH_STATE = {
  lang: 'en',
  messages: {
    'buttons.confirm': 'Confirm',
    'buttons.continue': 'Continue',
    'buttons.login': 'Login',
    'constants.phoneNumber': 'Phone number',
    'error.networkError': 'Unable to connect to server',
    'error.required.password': 'New password is not valid',
    'error.errorPhoneNumberNotFound': 'Mobile phone number not found.',
    'label.error': 'Invalid input',
    'login.stepOneInstruction': 'Please enter your Username and password.',
    'login.username': 'Username',
    'login.mobileLabel': 'Mobile number',
    'login.mobilePlaceholder': '07123456789',
    'login.passwordLabel': 'Password',
    'login.submit': 'Submit',
    'login.forgotPassword': "Can't login?",
    'login.submissionError': 'Sorry that Username and password did not work.',
    'login.forbiddenCredentialError': 'User is currently deactivated.',
    'login.codeSubmissionError': 'Sorry that code did not work.',
    'login.tooManyLoginAttemptError':
      'Too many login attempts. You can try again after one minute.',
    'login.tooManyCodeAttemptError':
      'Too many code entry attempts. You can try again after one minute.',
    'login.fieldMissing': 'Username/Password required',
    'login.resentSMS': 'We just resent you another code to {number}',
    'login.stepTwoResendTitle': 'Verification code resent',
    'login.resendMobile': 'Resend SMS',
    'login.optionalLabel': 'Optional',
    'login.stepTwoTitle': 'Verify your mobile phone',
    'login.verficationCodeLabel': 'Verification code (6 digits)',
    'login.stepTwoInstruction':
      'A verification code has been sent to your phone. ending in {number}. This code will be valid for 5 minutes.',
    'login.clearForm': 'Clear form',
    'login.manager.registerAppTitle': 'OpenCRVS Homepage',
    'login.manager.registerAppDescription':
      'Manage applications, registrations and certifications here.',
    'login.manager.performanceAppTitle': 'Performance Management',
    'login.manager.performanceAppDescription':
      "Analyse the performance of a particular area of your country in it's Civil Registration.",
    'resend.sms': 'Resend SMS',
    'resetCredentials.form.title':
      '{forgottenItem, select, username {Username reminder request} password {Password reset} other {}}',
    'resetCredentials.forgottenItem.form.title': "Can't login",
    'resetCredentials.forgottenItem.form.body.header':
      'What have you forgotten?',
    'resetCredentials.label.field.verificationCode':
      'Verification code (6 digits)',
    'resetCredentials.label.field.answer': 'Answer',
    'resetCredentials.option.username': 'My username',
    'resetCredentials.option.password': 'My password',
    'resetCredentials.phoneNumberConfirmation.form.body.header':
      'What is your phone number?',
    'resetCredentials.phoneNumberConfirmation.form.body.subheader':
      'This is the number assoricated with your account',
    'resetCredentials.recoveryCodeEntry.form.body.header':
      'Enter the 6-digit recovery code',
    'resetCredentials.recoveryCodeEntry.form.body.subheader':
      "The recovery code was sent to your phone number. Please enter the code. Didn't receive it?",
    'resetCredentials.recoveryCodeEntry.codeResent.form.body.header':
      'Verification code resent',
    'resetCredentials.recoveryCodeEntry.codeResent.form.body.subheader':
      'We just resent you another code to {number}.',
    'resetCredentials.securityQuestion.form.body.subheader':
      'This is one of the security questions you choose when setting up your account',
    'resetCredentials.success.page.title':
      '{forgottenItem, select, username {Username reminder sent} password {Password reset successful} other {}}',
    'resetCredentials.success.page.subtitle':
      '{forgottenItem, select, username {Check your phone for a reminder of your username} password {You can now login with your new password} other {}}',
    'misc.newPass.header': 'Choose a new password',
    'misc.newPass.instruction':
      'We recommend you create a unique password - one that you don’t use for another website or app. Note. You can’t reuse your old password once you change it.',
    'password.label.confirm': 'Confirm password',
    'password.label.new': 'New password',
    'password.cases': 'Contain upper and lower cases',
    'password.match': 'Passwords match',
    'password.minLength': '{min} characters minimum',
    'password.mismatch': 'Passwords do not match',
    'password.number': 'At least one number',
    'password.validation.msg': 'Password must have:',
    'validations.required': 'required',
    'validations.minLength': 'Must be {min} characters or more',
    'validations.numberRequired': 'Must be number',
    'validations.phoneNumberFormat':
      'Must be a valid mobile phone number. Starting with 0. e.g. {example}',
    'validations.mobilePhoneRegex': '0[0-9]{9,10}',
    'validations.mobileNumberFormat': '07123456789',
    'validations.requiredSymbol': 'x',
    'userSetup.securityQuestions.birthTown': 'What city were you born in?',
    'userSetup.securityQuestions.favoriteFood': 'What is your favorite food?',
    'userSetup.securityQuestions.favoriteMovie': 'What is your favorite movie?',
    'userSetup.securityQuestions.favoriteSong': 'What is your favorite song?',
    'userSetup.securityQuestions.favoriteTeacher':
      'What is the name of your favorite school teacher?',
    'userSetup.securityQuestions.firstChildName':
      "What is your first child's name?",
    'userSetup.securityQuestions.hightSchool':
      'What is the name of your high school?',
    'userSetup.securityQuestions.motherName': "What is your mother's name?"
  }
}
