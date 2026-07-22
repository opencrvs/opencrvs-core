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
import { fireEvent, within } from 'storybook/test'

/**
 * Local reimplementation of the subset of `react-select-event` used by our
 * interaction stories (`select`, `openMenu`), backed by Storybook's
 * instrumented testing utilities.
 *
 * `react-select-event` imports `act` from `@testing-library/react`, whose `act`
 * throws in the production React build that `storybook build` produces. That is
 * what previously required a shim aliasing `@testing-library/react` in the
 * Storybook build. Storybook's `fireEvent` handles `act` internally, so porting
 * these two helpers lets us drop both the dependency and the shim.
 */

// react-select nests its inner input five levels deep inside its container.
function getReactSelectContainerFromInput(input: HTMLElement): HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return input.parentNode!.parentNode!.parentNode!.parentNode!
    .parentNode as HTMLElement
}

/** Open a `react-select` dropdown menu. */
export async function openMenu(input: HTMLElement) {
  await fireEvent.focus(input)
  await fireEvent.keyDown(input, { key: 'ArrowDown', keyCode: 40, code: 40 })
}

/** Select one or more options in a `react-select` dropdown by visible text. */
export async function select(
  input: HTMLElement,
  optionOrOptions: string | RegExp | Array<string | RegExp>
): Promise<void> {
  const options = Array.isArray(optionOrOptions)
    ? optionOrOptions
    : [optionOrOptions]

  for (const option of options) {
    await openMenu(input)
    const container = getReactSelectContainerFromInput(input)
    const matchingElements = await within(container).findAllByText(option, {
      // ignore aria-live announcements and visually hidden nodes
      ignore: "[aria-live] *,[style*='visibility: hidden']"
    })
    /*
     * When the option is already selected, the display text also matches; the
     * actual menu option is positioned last in the DOM tree.
     */
    await fireEvent.click(matchingElements[matchingElements.length - 1])
  }
}
