import { App as OpenCRVSApp, routesConfig } from '@opencrvs/client/App'
import { createStore } from '@opencrvs/client/store'
import { queryClient, trpcOptionsProxy } from '@opencrvs/client/v2-events/trpc'
import {
  EventConfig,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import 'prismjs/components/prism-json'
// import 'prismjs/themes/prism.css'
import 'prismjs/themes/prism-tomorrow.css'
import React, { useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { createBrowserRouter } from 'react-router-dom'

import { JsonEditor } from 'json-edit-react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import * as z from 'zod'

import 'react-tabs/style/react-tabs.css'
import './App.css'

const { store } = createStore()

const router = createBrowserRouter(routesConfig, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
})

async function persistToURL(code: string) {
  const compressed = btoa(
    String.fromCharCode(
      ...new Uint8Array(
        await new Response(
          new Blob([code]).stream().pipeThrough(new CompressionStream('gzip'))
        ).arrayBuffer()
      )
    )
  )
  const url = new URL(window.location.href)
  url.searchParams.set('code', compressed)
  window.history.replaceState({}, '', url.toString())
}

function clearUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete('code')
  window.history.replaceState({}, '', url.toString())
}

async function retrieveCodeFromURL(): Promise<string | null> {
  const url = new URL(window.location.href)
  const compressed = url.searchParams.get('code')
  if (!compressed) return null

  const decompressedStream = new Response(
    new Blob([
      Uint8Array.from(
        atob(compressed)
          .split('')
          .map((c) => c.charCodeAt(0))
      )
    ])
      .stream()
      .pipeThrough(new DecompressionStream('gzip'))
  )

  return await decompressedStream.text()
}

const App: React.FC = () => {
  const [code, setCode] = useState('')

  async function resetToDefault() {
    setCode(JSON.stringify(tennisClubMembershipEvent, null, 2))
    updateAppState(JSON.stringify(tennisClubMembershipEvent, null, 2))
    clearUrl()
    window.location.reload()
  }

  useEffect(() => {
    retrieveCodeFromURL().then((urlCode) => {
      if (urlCode) {
        setCode(urlCode)
        updateAppState(urlCode)
      } else {
        setCode(JSON.stringify(tennisClubMembershipEvent, null, 2))
        updateAppState(JSON.stringify(tennisClubMembershipEvent, null, 2))
      }
    })
    router.subscribe(() => {
      persistToURL(code)
    })
  }, [])

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  )

  function updateAppState(code: string) {
    // If no timeout exists, execute immediately
    if (!debounceTimeout) {
      queryClient.setQueryData(trpcOptionsProxy.event.config.get.queryKey(), [
        JSON.parse(code)
      ])
    } else {
      // Clear existing timeout if one exists
      clearTimeout(debounceTimeout)
    }

    // Set new timeout for subsequent calls
    const timeout = setTimeout(() => {
      queryClient.setQueryData(trpcOptionsProxy.event.config.get.queryKey(), [
        JSON.parse(code)
      ])
      setDebounceTimeout(null) // Reset timeout state
    }, 300)

    setDebounceTimeout(timeout)
  }
  console.log(z.toJSONSchema(EventConfig))

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <PanelGroup autoSaveId="example" direction="horizontal">
        <Panel>
          <OpenCRVSApp router={router} store={store} />
        </Panel>
        <PanelResizeHandle />
        <Panel
          style={{
            flex: 1,
            width: '50vw',
            height: '100%',
            padding: '10px',
            borderLeft: '1px solid #ccc'
          }}
        >
          <Tabs
            style={{ display: 'flex', height: '100%', flexDirection: 'column' }}
          >
            <TabList style={{ textAlign: 'left' }}>
              <Tab
                style={{
                  background: '#000',
                  color: '#fff',
                  borderRadius: '0',
                  border: 0
                }}
              >
                <span
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Configuration
                </span>
              </Tab>
              <Tab>AI</Tab>
            </TabList>
            <TabPanel
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                position: 'relative',
                justifyContent: 'flex-start',
                overflow: 'auto'
              }}
            >
              <div>
                <button onClick={resetToDefault}>Reset</button>
                <button onClick={resetToDefault}>Share</button>
                <button onClick={resetToDefault}>Export</button>
              </div>
              <div style={{ overflow: 'auto' }}>
                <div>
                  <JsonEditor
                    collapse={true}
                    enableClipboard={false}
                    data={code && JSON.parse(code)}
                    setData={(code) => {
                      setCode(JSON.stringify(code))
                      persistToURL(JSON.stringify(code))
                      updateAppState(JSON.stringify(code))
                    }}
                  />
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <h2>Any content 2</h2>
            </TabPanel>
          </Tabs>
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default App
