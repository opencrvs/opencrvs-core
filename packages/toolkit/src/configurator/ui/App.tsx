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
import { useEffect, useState } from 'react'
import { ConnectStep, type Connected } from './app/ConnectStep'
import { FormStep } from './app/FormStep'
import { MockConnection } from './github/connection'
import { HttpConnection, HttpGitHub } from './github/http'
import { MockGitHub } from './github/mock'
import { HttpLocalServer } from './local/http'

const local = new HttpLocalServer()
// Real GitHub (through the local dev server) unless the page was built with VITE_MOCK_GITHUB=1.
const USE_MOCK = import.meta.env.VITE_MOCK_GITHUB === '1'
const github = USE_MOCK ? new MockGitHub('existing') : new HttpGitHub()
const connection = USE_MOCK ? new MockConnection() : new HttpConnection()

type State = { mode: 'github'; connected: Connected } | { mode: 'local' } | null

export function App() {
  const [state, setState] = useState<State>(null)

  // A reload starts at the Connect screen, so make the dev server forget any earlier token.
  useEffect(() => {
    if (github instanceof HttpGitHub) void github.disconnect()
  }, [])

  if (!state) {
    return (
      <ConnectStep
        local={local}
        connection={connection}
        onConnected={(connected) => setState({ mode: 'github', connected })}
        onSkip={() => setState({ mode: 'local' })}
      />
    )
  }

  const connected = state.mode === 'github' ? state.connected : undefined
  return (
    <FormStep
      github={connected ? github : undefined}
      local={local}
      label={connected ? `GitHub: ${connected.owner}/${connected.repo}${USE_MOCK ? ' (mock)' : ''}` : 'GitHub skipped, local environments folder only'}
      warnings={
        connected?.missingPermissions.length
          ? [`This token cannot ${connected.missingPermissions.join(' or ')}, so provisioning and the runner will not work with it.`]
          : []
      }
      onChangeConnection={() => {
        if (github instanceof HttpGitHub) void github.disconnect()
        setState(null)
      }}
    />
  )
}
