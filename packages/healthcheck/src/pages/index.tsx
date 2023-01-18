import Head from 'next/head'
import type { InferGetServerSidePropsType } from 'next'
import { checkHealth } from '@/lib/check-health'

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
      {JSON.stringify(health)}
    </>
  )
}
