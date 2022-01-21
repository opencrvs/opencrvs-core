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
import { colorDictionary } from '../colors'

function ColorsDisplay() {
  return (
    <div>
      <h1>Colors</h1>
      <ul
        className="color-container"
        style={{
          listStyle: 'none',
          padding: '10px 10px 10px 10px',
          display: 'inline-flex',
          flexWrap: 'wrap'
        }}
      >
        {Object.entries(colorDictionary).map(([name, color], i) => (
          <li key={i}>
            <div className="color-palette">
              <div
                className="color-box"
                style={{
                  backgroundColor: color,
                  display: 'inline-flex',
                  height: '64px',
                  width: '64px',
                  marginTop: '64px',
                  marginLeft: '56px',
                  borderRadius: '3px'
                }}
              />
              <div
                style={{
                  display: 'flex',
                  fontSize: '14px',
                  lineHeight: '30px',
                  marginLeft: '56px',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    width: '100px'
                  }}
                >
                  <div
                    style={{
                      userSelect: 'none',
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}
                  >
                    {name}
                  </div>
                </div>
                <div>{color}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
export default ColorsDisplay
