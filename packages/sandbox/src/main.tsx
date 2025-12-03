import { setupWorker } from 'msw/browser'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { testDataGenerator } from '@opencrvs/client/tests/test-data-generators'
import { handlers } from '@opencrvs/client/tests/default-request-handlers'
import './App.css'
import { TRPCProvider } from '@opencrvs/client/v2-events/trpc.tsx'

const server = setupWorker(...Object.values(handlers).flat())

const generator = testDataGenerator()

window.localStorage.setItem('opencrvs', generator.user.token.fieldAgent)
;(async () => {
  await server.start()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <TRPCProvider persistence={false}>
        <App />
      </TRPCProvider>
    </StrictMode>
  )
})()
