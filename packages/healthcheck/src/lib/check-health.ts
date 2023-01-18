import path from 'path'

if (!process.env.GATEWAY_URL) {
  throw new Error('Environment variable "GATEWAY_URL" is not set')
}

const GATEWAY_HEALTHCHECK_PATH = path.join(process.env.GATEWAY_URL, '/ping')

type Service = {
  name: string
  url: string
  status: boolean
}

export async function checkHealth() {
  const res = await fetch(GATEWAY_HEALTHCHECK_PATH)
  return res.json() as Promise<Service[]>
}
