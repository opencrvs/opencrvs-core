import fetch from 'node-fetch'

enum Status {
  OK = 'ok',
  ERROR = 'error'
}

interface ServiceHealth extends Record<string, unknown> {
  status: Status
}

export type PingService = { name: string; url: URL }

export const getServiceHealth = async (
  service: PingService
): Promise<ServiceHealth> => {
  const response = await fetch(service.url, {
    method: 'GET'
  })

  return response.json()
}
