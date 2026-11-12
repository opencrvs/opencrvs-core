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
import { createElement } from 'react'
import { ReactQuestionFactory, SurveyQuestionElementBase } from 'survey-react-ui'
import type { Model } from 'survey-core'
import type { QuestionSecretModel } from './secretQuestion'
import { isDefinedOnGitHub } from './secrets'

interface State {
  revealed: boolean
  editing: boolean
  copy: 'idle' | 'copied' | 'failed'
}

class SurveyQuestionSecret extends SurveyQuestionElementBase {
  state: State = { revealed: false, editing: false, copy: 'idle' }
  private copiedTimer?: ReturnType<typeof setTimeout>
  private field: HTMLElement | null = null

  private get secret() {
    return this.questionBase as QuestionSecretModel
  }

  componentWillUnmount() {
    clearTimeout(this.copiedTimer)
    super.componentWillUnmount()
  }

  private copy = async () => {
    const value = this.secret.value
    if (typeof value !== 'string' || !value) return
    let copy: State['copy'] = 'copied'
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Clipboard access can be denied; the user can still reveal and select the value.
      copy = 'failed'
    }
    this.setState({ copy })
    clearTimeout(this.copiedTimer)
    this.copiedTimer = setTimeout(() => this.setState({ copy: 'idle' }), 1500)
  }

  private edit = () => this.setState({ editing: true }, () => this.field?.focus())

  // Back to keeping what GitHub has: whatever was typed is dropped.
  private cancel = () => {
    this.secret.clearValue()
    this.setState({ editing: false, revealed: false })
  }

  protected renderElement() {
    const question = this.secret
    const { revealed, editing, copy } = this.state
    // GitHub never returns secret values; an existing one shows as locked and is kept unless replaced.
    const defined = isDefinedOnGitHub(question.survey as Model, question)
    const value = (question.value as string | undefined) ?? ''

    // Nothing can be typed until Edit is pressed, so a value on GitHub is not replaced by accident.
    if (defined && !value && !editing) {
      return (
        <div className="secret-question">
          <div className="sd-formbox sd-text secret-question__box secret-question__box--locked">
            <input
              className="sd-formbox__input secret-question__input"
              type="password"
              disabled
              placeholder="••••••••••••"
              aria-label={`${question.title} (defined on GitHub)`}
            />
            <button type="button" disabled={question.isReadOnly} onClick={this.edit}>
              Edit
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="secret-question">
        <div className={`sd-formbox sd-text secret-question__box${question.multiline ? ' secret-question__box--multiline' : ''}`}>
          {question.multiline ? (
            // A certificate or a key has line breaks, which a one-line field would drop when pasted.
            <textarea
              ref={(element) => {
                this.field = element
              }}
              className={`sd-formbox__input secret-question__input secret-question__textarea${
                question.masked && !revealed ? ' secret-question__textarea--masked' : ''
              }`}
              rows={6}
              wrap="off"
              value={value}
              readOnly={question.isReadOnly}
              autoComplete="off"
              spellCheck={false}
              aria-label={question.title}
              onChange={(event) => (question.value = event.target.value)}
            />
          ) : (
            <input
              ref={(element) => {
                this.field = element
              }}
              className="sd-formbox__input secret-question__input"
              type={question.masked && !revealed ? 'password' : 'text'}
              value={value}
              readOnly={question.isReadOnly}
              autoComplete="new-password"
              spellCheck={false}
              aria-label={question.title}
              onChange={(event) => (question.value = event.target.value)}
            />
          )}
          {defined && (
            <button type="button" onClick={this.cancel}>
              Cancel
            </button>
          )}
        </div>
        {question.autoGenerate && (
          <button type="button" disabled={question.isReadOnly} onClick={() => question.generate()}>
            Generate
          </button>
        )}
        {question.masked && (
          <button type="button" onClick={() => this.setState({ revealed: !revealed })}>
            {revealed ? 'Hide' : 'Reveal'}
          </button>
        )}
        {question.autoGenerate && (
          <button type="button" disabled={!value} onClick={this.copy}>
            {{ idle: 'Copy', copied: 'Copied', failed: 'Copy failed' }[copy]}
          </button>
        )}
      </div>
    )
  }
}

ReactQuestionFactory.Instance.registerQuestion('secret', (props) =>
  createElement(SurveyQuestionSecret, props)
)
