function sha512(str: string) {
  return crypto.subtle
    .digest('SHA-512', new TextEncoder().encode(str))
    .then((buf) => {
      return Array.prototype.map
        .call(new Uint8Array(buf), (x) => ('00' + x.toString(16)).slice(-2))
        .join('')
    })
}

type Options = { apiURL: string; username: string; password: string }
const authenticate = async (options: Options) => {
  return fetch(`${options.apiURL}/authenticate/${options.username}`).then(
    (res) => res.json()
  )
}

export const generateOpenHIMCredentials = async (options: Options) => {
  const authDetails = await authenticate(options)

  const salt = authDetails.salt
  const now = new Date()

  // create passhash
  let passhash = await sha512(salt + options.password)

  // create token
  const token = await sha512(passhash + salt + now)

  // define request headers with auth credentials
  return {
    'auth-username': options.username,
    'auth-ts': now,
    'auth-salt': salt,
    'auth-token': token
  }
}

export function getChannels(
  credentials: Awaited<ReturnType<typeof generateOpenHIMCredentials>>
) {
  return fetch(`https://localhost:8080/channels`, {
    headers: credentials as any
  }).then((res) => res.json())
}
