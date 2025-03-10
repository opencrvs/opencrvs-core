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
import { Pages } from '@client/v2-events/features/events/actions/declare'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { birthDocument } from './fixtures'

const meta: Meta<typeof Pages> = {
  title: 'File'
}

export default meta

type Story = StoryObj<typeof Pages>

export const BirthSupportingDocuments: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
        eventId: birthDocument.id,
        pageId: 'documents'
      })
    }
  }
}
