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
import Head from 'next/head'
import type { InferGetServerSidePropsType } from 'next'
import { checkHealth } from '@/lib/check-health'
import { Services } from '@/components/Services'

export async function getServerSideProps() {
  const health = await checkHealth()
  return { props: { health } }
}

export default function Home({
  health
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>OpenCRVS Healthcheck</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Services services={health} />
    </>
  )
}
