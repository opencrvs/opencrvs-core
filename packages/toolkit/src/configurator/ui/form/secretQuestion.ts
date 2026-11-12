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
import { Question, Serializer } from 'survey-core'
import { generateSecret, type Charset } from './generate'

// A password-style question with generate, reveal and copy controls (the
// controls live in SecretQuestionView.tsx). The value is created by an explicit
// call to generate(), never by an expression, so it stays stable across
// re-renders, page changes and edits to other answers.
export class QuestionSecretModel extends Question {
  getType() {
    return 'secret'
  }

  get length(): number {
    return this.getPropertyValue('length')
  }
  set length(value: number) {
    this.setPropertyValue('length', value)
  }

  get charset(): Charset {
    return this.getPropertyValue('charset')
  }
  set charset(value: Charset) {
    this.setPropertyValue('charset', value)
  }

  get autoGenerate(): boolean {
    return this.getPropertyValue('autoGenerate')
  }
  set autoGenerate(value: boolean) {
    this.setPropertyValue('autoGenerate', value)
  }

  get multiline(): boolean {
    return this.getPropertyValue('multiline')
  }
  set multiline(value: boolean) {
    this.setPropertyValue('multiline', value)
  }

  get masked(): boolean {
    return this.getPropertyValue('masked')
  }
  set masked(value: boolean) {
    this.setPropertyValue('masked', value)
  }

  generate() {
    this.value = generateSecret(this.length, this.charset)
  }
}

if (!Serializer.findClass('secret')) {
  Serializer.addClass(
    'secret',
    [
      { name: 'length:number', default: 16 },
      { name: 'charset', default: 'alphanumeric', choices: ['alphanumeric', 'hex', 'username'] },
      { name: 'autoGenerate:boolean', default: false },
      // Shown as dots until revealed. Off for values that are not sensitive, such as a host name.
      { name: 'masked:boolean', default: true },
      // A text area instead of a one-line field, for values with line breaks such as a certificate.
      { name: 'multiline:boolean', default: false }
    ],
    () => new QuestionSecretModel(''),
    'question'
  )
}

// Marks any question as holding a secret, so it is masked and kept out of exports.
if (!Serializer.findProperty('question', 'secret')) {
  Serializer.addProperty('question', { name: 'secret:boolean', default: false })
}
