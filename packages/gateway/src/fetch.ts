import nodeFetch from 'node-fetch'

export default function fetch(...params: Parameters<typeof nodeFetch>) {
  return nodeFetch(...params)
}
