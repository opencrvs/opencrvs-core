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
import type { ReactNode } from 'react'
import logo from '../assets/opencrvs-logo.svg'

// The bar at the top of every screen. Screens put what belongs to them (connection, actions) on the right.
// The logo is the word "OpenCRVS", so the heading still reads "OpenCRVS Environment configuration" to a screen reader.
// On a phone "Environment configuration" gives way to a small line under the logo (see src/styles.css).
export function AppHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="app__header">
      <div className="app__brand">
        <h1>
          <img className="app__logo" src={logo} alt="OpenCRVS" />
          <span className="app__setup">Environment configuration</span>
        </h1>
        <p className="app__tagline">Environment configuration</p>
      </div>
      {children && <div className="app__header-right">{children}</div>}
    </header>
  )
}
