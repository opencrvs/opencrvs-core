import { CreateTRPCClient, createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { AppRouter } from '@opencrvs/events/build/types/router'

/**
 * Creates a tRPC client with the specified base URL and authorization token.
 *
 * @param baseUrl - The base URL where the tRPC server can be found, e.g., 'https://farajaland.opencrvs.org/api/trpc'.
 * @param token - The authorization token to be used in the request headers.
 * @returns A tRPC client configured with the provided base URL and authorization token.
 */
export function createClient(
  baseUrl: string,
  token: `Bearer ${string}`
): CreateTRPCClient<AppRouter> {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: baseUrl,
        transformer: superjson,
        headers() {
          return {
            Authorization: token
          }
        }
      })
    ]
  })
}
