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
import { FormPageConfig } from './PageConfig'

const pageInput = {
  id: 'applicant',
  title: {
    id: 'page.title',
    defaultMessage: 'Applicant details',
    description: 'Page title'
  },
  fields: []
}

describe('PageConfig', () => {
  it('leaves showClearButton undefined when not provided', () => {
    const parsed = FormPageConfig.parse(pageInput)
    expect(parsed.showClearButton).toBeUndefined()
  })

  it('allows enabling showClearButton', () => {
    const parsed = FormPageConfig.parse({ ...pageInput, showClearButton: true })
    expect(parsed.showClearButton).toBe(true)
  })
})
