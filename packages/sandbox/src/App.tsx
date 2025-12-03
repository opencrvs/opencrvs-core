import { App as OpenCRVSApp, routesConfig } from '@opencrvs/client/App'
import { createStore } from '@opencrvs/client/store'
import { useEventConfigurations } from '@opencrvs/client/v2-events/features/events/useEventConfiguration'
import { queryClient, trpcOptionsProxy } from '@opencrvs/client/v2-events/trpc'
import type { EventConfig } from '@opencrvs/commons/client'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism.css'
import 'prismjs/themes/prism-solarizedlight.css'
import React, { useState } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Editor from 'react-simple-code-editor'
import './App.css'
console.log(languages)

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
// You can choose other themes as well

const App: React.FC = () => {
  const configs = useEventConfigurations()
  const [code, setCode] = useState(JSON.stringify(configs[0], null, 2))

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <div style={{ flex: 1, overflow: 'auto', width: '50vw' }}>
        <OpenCRVSApp router={router} store={store} />
      </div>
      <div
        style={{
          flex: 1,
          width: '50vw',
          padding: '10px',
          borderLeft: '1px solid #ccc'
        }}
      >
        <div style={{ overflow: 'auto', height: '100%' }}>
          <Editor.default
            value={code}
            onValueChange={(code) => {
              setCode(code)

              try {
                JSON.parse(code)
              } catch (error) {
                return
              }

              const currentConfigs =
                queryClient.getQueryData<EventConfig[]>(
                  trpcOptionsProxy.event.config.get.queryKey()
                ) || []

              queryClient.setQueryData(
                trpcOptionsProxy.event.config.get.queryKey(),
                currentConfigs.map((cfg, index) =>
                  index === 0 ? JSON.parse(code) : cfg
                )
              )
            }}
            highlight={(code: string) =>
              highlight(code, languages.json, 'json')
            }
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default App
