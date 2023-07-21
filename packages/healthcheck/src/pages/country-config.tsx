import { Content } from '@opencrvs/components'
import { Icon } from '@opencrvs/components/lib/Icon'
import React from 'react'
import { Check } from 'react-feather'

async function getCountryConfig(): Promise<{ COUNTRY: string }> {
  const res = await fetch(
    new URL('/client-config.js', 'http://localhost:3040').href
  )
  if (!res.ok) {
    throw new Error(`Could not fetch config, ${res.statusText} ${res.status}`)
  }
  return Function(`let window={}; ${await res.text()} ; return window.config`)()
}

export default function CountryConfig() {
  return (
    <div>
      {/* <Content title="Country config">
        <Check<{ COUNTRY: string }>
          check={getCountryConfig}
          ok={(conf) => {
            return (
              <span>
                Country config configured with code{' '}
                <strong>{conf.COUNTRY}</strong>
              </span>
            )
          }}
          fail={() => <span>Country config not running</span>}
          instructions={
            <span>
              Go to your country config repository (opencrvs-farajaland or
              opencrvs-your-country) and run <strong>yarn dev</strong>.
            </span>
          }
        />
      </Content> */}
    </div>
  )
}
