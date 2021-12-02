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
export const BENGALI_STATE = {
  lang: 'bn',
  displayName: 'বাংলা',
  messages: {
    'buttons.confirm': 'নিশ্চিত করুন',
    'buttons.continue': 'পরবর্তী',
    'buttons.login': 'লগইন',
    'constants.phoneNumber': 'ফোন নম্বর',
    'error.networkError': 'সার্ভারের সাথে সংযোগ করা যাচ্ছে না',
    'error.required.password': 'নতুন পাসওয়ার্ডটি সঠিক নয়',
    'error.errorPhoneNumberNotFound': 'মোবাইল ফোন নম্বর পাওয়া যায় নি।',
    'label.error': 'অবৈধ ইনপুট',
    'login.stepOneInstruction':
      'অনুগ্রহপূর্বক আপনার ব্যবহারকারীর নাম  এবং পাসওয়ার্ড টাইপ করুন',
    'login.username': 'ব্যবহারকারীর নাম',
    'login.mobileLabel': 'মোবাইল নম্বর',
    'login.mobilePlaceholder': '01723456789',
    'login.passwordLabel': 'পাসওয়ার্ড',
    'login.verficationCodeLabel': 'ভেরিফিকেশন কোড (৬ সংখ্যার)',
    'login.submit': 'সাবমিট',
    'login.forgotPassword': 'পাসওয়ার্ড ভুলে গেছেন',
    'login.submissionError': 'ব্যবহারকারীর নাম/পাসওয়ার্ড সঠিক নয়',
    'login.forbiddenCredentialError': 'ব্যবহারকারীর অ্যাকাউন্টি নিষ্ক্রিয় আছে',
    'login.codeSubmissionError': 'পিনকোডটি সঠিক নয়',
    'login.fieldMissing': 'ব্যবহারকারীর নাম/পাসওয়ার্ড দিতে হবে',
    'login.resentSMS':
      'আমরা আপনার মোবাইল নম্বর, {number} তে একটি নতুন এসএমএস প্রেরণ করেছি',
    'login.stepTwoResendTitle': 'ভেরিফিকেশন কোড পুনঃপ্রেরণ',
    'login.resendMobile': 'এসএমএস পুনঃপ্রেরণ',
    'login.optionalLabel': 'ঐচ্ছিক',
    'login.stepTwoTitle': 'আপনার মোবাইল যাচাই করুন',
    'login.stepTwoInstruction':
      'অনুগ্রহপূর্বক আপনার মোবাইল নম্বর, {number} তে প্রেরিত বার্তা থেকে পিনকোডটি (ইংরেজিতে) টাইপ করুন। এটি ৫ মিনিট পর্যন্ত কার্যকর থাকবে।',
    'login.clearForm': 'বাতিল',
    'login.manager.registerAppTitle': 'ওপেন সিআরভিএস  হোমপেইজ',
    'login.manager.registerAppDescription':
      'আবেদন পরিচালনা, নিবন্ধন এবং  সার্টিফিকেশন',
    'login.manager.performanceAppTitle': 'কর্মদক্ষতা ব্যবস্থাপনা',
    'login.manager.performanceAppDescription':
      'নাগরিক নিবন্ধনের ক্ষেত্রে দেশের নির্দিষ্ট এলাকার কর্মদক্ষতা বিশ্লেষণ করুন',
    'resend.sms': 'এসএমএস পুনরায় পাঠান',
    'resetCredentials.form.title':
      '{forgottenItem, select, username {ব্যবহারকারীর নাম পুনরুদ্ধারের অনুরোধ} password {পাসওয়ার্ড পুনরায় সেট করুন}}',
    'resetCredentials.forgottenItem.form.title': 'লগইন হচ্ছেনা',
    'resetCredentials.forgottenItem.form.body.header': 'আপনি কি ভুলে গেছেন',
    'resetCredentials.label.field.verificationCode': 'যাচাইকরণ কোড (৬ ডিজিট)',
    'resetCredentials.label.field.answer': 'উত্তর',
    'resetCredentials.option.username': 'আমার নাম',
    'resetCredentials.option.password': 'আমার পাসওয়ার্ড',
    'resetCredentials.phoneNumberConfirmation.form.body.header':
      'আপনার ফোন নম্বর কি?',
    'resetCredentials.phoneNumberConfirmation.form.body.subheader':
      'এটি আপনার অ্যাকাউন্টের সাথে সংযুক্ত নম্বর',
    'resetCredentials.recoveryCodeEntry.form.body.header':
      '৬-সংখ্যার পুনরুদ্ধার কোড লিখুন',
    'resetCredentials.recoveryCodeEntry.form.body.subheader':
      'পুনরুদ্ধার কোডটি আপনার ফোন নম্বরটিতে প্রেরণ করা হয়েছে। কোডটি লিখুন। কোড পৌঁছায়নি?',
    'resetCredentials.recoveryCodeEntry.codeResent.form.body.header':
      'যাচাই কোড পুনরায় পাঠানো হয়েছে',
    'resetCredentials.recoveryCodeEntry.codeResent.form.body.subheader':
      'আপনাকে {number} নম্বরে একটি কোড প্রেরণ করা হয়েছে।',
    'resetCredentials.securityQuestion.form.body.subheader':
      'আপনি অ্যাকাউন্ট সেট আপ করার সময় যে সুরক্ষা প্রশ্নগুলি চয়ন করেছিলেন এটি তার মধ্যে একটি',
    'resetCredentials.success.page.title':
      '{forgottenItem, select, username {ব্যবহারকারীর নাম পাঠানো হয়েছে} password {সফলভাবে পাসওয়ার্ড পুনরায় সেট হয়েছে}}',
    'resetCredentials.success.page.subtitle':
      '{forgottenItem, select, username {আপনার ব্যবহারকারীর নামের জন্য আপনার ফোনটি পরীক্ষা করুন} password {আপনি এখন আপনার নতুন পাসওয়ার্ড দিয়ে লগইন করতে পারেন}}',
    'misc.newPass.header': 'নতুন একটি পাসওয়ার্ড পছন্দ করুন',
    'misc.newPass.instruction':
      'আমরা আপনাকে একটি অনন্য পাসওয়ার্ড তৈরির সুপারিশ করি - যেটি আপনি অন্য কোনও ওয়েবসাইট বা অ্যাপ্লিকেশনের জন্য ব্যবহার করেন না। বিঃদ্রঃ. আপনি এটি একবার পরিবর্তন করার পরে আপনার পুরানো পাসওয়ার্ড পুনরায় ব্যবহার করতে পারবেন না।',
    'password.cases': 'বড় হাতের এবং ছোট হাতের অক্ষর',
    'password.label.confirm': 'পাসওয়ার্ড নিশ্চিত করুন',
    'password.label.new': 'নতুন পাসওয়ার্ড',
    'password.match': 'উল্লেখিত পাসওয়ার্ড মিলেছে',
    'password.minLength': 'সর্বনিম্ন {min}-টি অক্ষর',
    'password.mismatch': 'উল্লেখিত পাসওয়ার্ড মিলে নি',
    'password.number': 'অন্ততঃ একটি নম্বর',
    'password.validation.msg': 'পাসওয়ার্ড-এ যে বিষয়গুলো অবশ্যই থাকতে হবে:',
    'validations.required': 'প্রয়োজনীয়',
    'validations.minLength': 'নূন্যতম {Min} অক্ষরের হতে হবে',
    'validations.numberRequired': 'সংখ্যা হতে হবে',
    'validations.phoneNumberFormat':
      'সঠিক মোবাইল নম্বর হতে হবে এবং শূন্য দিয়ে শুরু হতে হবে।',
    'validations.mobilePhoneRegex': '017[0-9]{9,10}',
    'validations.mobileNumberFormat': '01723456789',
    'validations.requiredSymbol': 'x',
    'userSetup.securityQuestions.birthTown': 'কোন শহরে আপনার জন্ম হয়?',
    'userSetup.securityQuestions.favoriteFood': 'আপনার প্রিয় খাদ্য কি?',
    'userSetup.securityQuestions.favoriteMovie': 'আপনার প্রিয় সিনেমা কি?',
    'userSetup.securityQuestions.favoriteSong': 'আপনার প্রিয় গান কি?',
    'userSetup.securityQuestions.favoriteTeacher':
      'আপনার প্রিয় স্কুল শিক্ষকের নাম কি?',
    'userSetup.securityQuestions.firstChildName':
      'আপনার প্রথম সন্তানের নাম কি?',
    'userSetup.securityQuestions.hightSchool': 'আপনার উচ্চ বিদ্যালয় নাম কি?',
    'userSetup.securityQuestions.motherName': 'আপনার মা এর নাম কি?'
  }
}
