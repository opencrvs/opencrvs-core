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
import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { TranslationTextWithFormatModifier } from './TranslationTextWithFormatModifier'

const meta: Meta<typeof TranslationTextWithFormatModifier> = {
  title: 'Components/TranslationTextWithFormatModifier',
  component: TranslationTextWithFormatModifier,
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  args: {
    element: 'p',
    variant: 'reg16'
  }
}

export default meta
type Story = StoryObj<typeof TranslationTextWithFormatModifier>

/**
 * Waits for the element containing expectedText to appear, then asserts its
 * tag name. Uses findByText (async, retrying) so assertions are safe against
 * the WaitForUserDetails render delay in the global storybook decorator.
 */
async function checkTag(
  canvasElement: HTMLElement,
  tag: string,
  expectedText: string
) {
  const el = await within(canvasElement).findByText(expectedText)
  await expect(
    el.tagName.toLowerCase(),
    `"${expectedText}" should be wrapped in <${tag}>`
  ).toBe(tag)
}

/**
 * <strong> bold with semantic importance
 * <b>      bold without semantic meaning
 * <em>     italic with semantic emphasis
 * <i>      italic without semantic meaning
 */
export const BoldAndEmphasis: Story = {
  args: {
    message: {
      id: 'test.bold-emphasis',
      defaultMessage:
        '<strong>important</strong> <b>bold</b> <em>emphasis</em> <i>italic</i>'
    }
  },
  play: async ({ canvasElement }) => {
    await checkTag(canvasElement, 'strong', 'important')
    await checkTag(canvasElement, 'b', 'bold')
    await checkTag(canvasElement, 'em', 'emphasis')
    await checkTag(canvasElement, 'i', 'italic')
  }
}

/**
 * <u>    underline
 * <mark> highlight (yellow background by default)
 * <del>  strikethrough — deleted / removed content
 * <ins>  underline — inserted / added content
 */
export const TextDecoration: Story = {
  args: {
    message: {
      id: 'test.decoration',
      defaultMessage:
        '<u>underline</u> <mark>highlight</mark> <del>deleted</del> <ins>inserted</ins>'
    }
  },
  play: async ({ canvasElement }) => {
    await checkTag(canvasElement, 'u', 'underline')
    await checkTag(canvasElement, 'mark', 'highlight')
    await checkTag(canvasElement, 'del', 'deleted')
    await checkTag(canvasElement, 'ins', 'inserted')
  }
}

/**
 * <small> fine print / reduced font size
 * <sub>   subscript  e.g. H<sub>subscript</sub>
 * <sup>   superscript e.g. x<sup>superscript</sup>
 */
export const SizeModifiers: Story = {
  args: {
    message: {
      id: 'test.size',
      defaultMessage:
        '<small>small/fine print</small> <sub>subscript</sub> <sup>superscript</sup>'
    }
  },
  play: async ({ canvasElement }) => {
    await checkTag(canvasElement, 'small', 'small/fine print')
    await checkTag(canvasElement, 'sub', 'subscript')
    await checkTag(canvasElement, 'sup', 'superscript')
  }
}

/**
 * <code> inline monospace code
 * <kbd>  keyboard input  e.g. press <kbd>Ctrl+S</kbd>
 * <q>    inline quotation — browser adds locale-aware quote marks via CSS
 */
export const CodeAndQuotation: Story = {
  args: {
    message: {
      id: 'test.code',
      defaultMessage:
        'Run <code>npm install</code>, press <kbd>Enter</kbd>, then <q>confirm</q>'
    },
    element: 'span'
  },
  play: async ({ canvasElement }) => {
    await checkTag(canvasElement, 'code', 'npm install')
    await checkTag(canvasElement, 'kbd', 'Enter')
    await checkTag(canvasElement, 'q', 'confirm')
  }
}

/**
 * <br></br>   line break — note: react-intl ignores self-closing <br/>
 * <tab></tab> 2em inline indent spacer (custom tag, not a standard HTML element)
 */
export const LineBreakAndTab: Story = {
  args: {
    message: {
      id: 'test.layout',
      defaultMessage: 'line one<br></br>line two<tab></tab>indented'
    }
  },
  play: async ({ canvasElement }) => {
    // Wait for the component to render before doing querySelector checks
    await within(canvasElement).findByText(/line one/, { exact: false })

    await expect(
      canvasElement.querySelector('br'),
      '<br> element should be rendered for line breaks'
    ).not.toBeNull()

    await expect(
      canvasElement.querySelector('span[style*="2em"]'),
      '<tab> should render a span with 2em width'
    ).not.toBeNull()
  }
}
