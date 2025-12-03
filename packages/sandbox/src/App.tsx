import { App as OpenCRVSApp, routesConfig } from '@opencrvs/client/App'
import { createStore } from '@opencrvs/client/store'
import { queryClient, trpcOptionsProxy } from '@opencrvs/client/v2-events/trpc'
import { tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-json'
// import 'prismjs/themes/prism.css'
import 'prismjs/themes/prism-tomorrow.css'
import React, { useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { createBrowserRouter } from 'react-router-dom'

import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { JsonEditor, githubLightTheme } from 'json-edit-react'

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

  function resetToDefault() {
    setCode(JSON.stringify(tennisClubMembershipEvent, null, 2))
    persistToURL(JSON.stringify(tennisClubMembershipEvent, null, 2))
    updateAppState(JSON.stringify(tennisClubMembershipEvent, null, 2))
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
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    const timeout = setTimeout(() => {
      queryClient.setQueryData(trpcOptionsProxy.event.config.get.queryKey(), [
        JSON.parse(code)
      ])
    }, 300)

    setDebounceTimeout(timeout)
  }

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
                  📝 Code
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
              </div>
              <div style={{ overflow: 'auto' }}>
                <div>
                  <JsonEditor
                    // theme={githubLightTheme}
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
                {/* <Editor.default
                value={code}
                  onValueChange={(code) => {
                    setCode(code)
                    persistToURL(code)
                    try {
                      JSON.parse(code)
                    } catch (error) {
                      return
                    }

                    updateAppState(code)
                  }}
                  highlight={(code: string) =>
                    highlight(code, languages.json, 'json')
                  }
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12
                  }}
                /> */}
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
