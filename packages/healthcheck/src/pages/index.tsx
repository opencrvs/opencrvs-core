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
import { Favicon } from '@/components/Favicon'
import { Services } from '@/components/Services'
import { checkHealth, Service } from '@/lib/check-health'
import type { InferGetServerSidePropsType } from 'next'
import Head from 'next/head'

const isAllOk = (services: Service[]) =>
  services.every((service) => service.status)

export async function getServerSideProps() {
  const services = await checkHealth()

  return {
    props: {
      services,
      isAllOk: isAllOk(services)
    }
  }
}

export default function Home({
  services,
  isAllOk
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>
          <>{!isAllOk ? '! ' : ''}OpenCRVS healthcheck</>
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Favicon status={isAllOk ? 'ok' : 'error'} />
      </Head>
      <Services services={services} />
    </>
  )
}
