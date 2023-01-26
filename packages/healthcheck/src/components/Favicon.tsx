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

import React from 'react'

const HEALTH_COLORS = {
  ok: '#62d200',
  warn: '#ff9100',
  error: '#ff2200'
}

const favicon = (status: keyof typeof HEALTH_COLORS) =>
  `data:image/svg+xml,%3Csvg width='175' height='169' viewBox='0 0 175 169' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_1_19)'%3E%3Cpath d='M109.375 0H109.226C107.646 0 106.268 1.17526 106.131 2.74897C104.739 18.7205 91.3327 31.25 75 31.25C58.6674 31.25 45.2612 18.7205 43.8692 2.74897C43.7321 1.17526 42.3536 0 40.774 0H40.625C18.1884 0 0 18.1884 0 40.625V109.375C0 131.812 18.1884 150 40.625 150H40.774C42.3536 150 43.7321 148.825 43.8692 147.251C45.2612 131.28 58.6674 118.75 75 118.75C91.3327 118.75 104.739 131.28 106.131 147.251C106.268 148.825 107.646 150 109.226 150H109.375C131.812 150 150 131.812 150 109.375V40.625C150 18.1884 131.812 0 109.375 0ZM75 106.25C57.7412 106.25 43.75 92.259 43.75 75C43.75 57.7412 57.7412 43.75 75 43.75C92.259 43.75 106.25 57.7412 106.25 75C106.25 92.259 92.259 106.25 75 106.25Z' fill='%231470FF'/%3E%3Ccircle cx='128' cy='122' r='47' fill='${encodeURIComponent(
    HEALTH_COLORS[status]
  )}'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_1_19'%3E%3Crect width='175' height='169' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A`

export const Favicon = ({ status }: { status: keyof typeof HEALTH_COLORS }) => {
  return <link rel="icon" href={favicon(status)} />
}
